import { NextRequest } from 'next/server';
import { getServerSession, Role } from './auth';
import { prisma } from '@/prisma';
import { BadRequestMessage, ForbiddenMessage, InternalServerErrorMessage, UnauthorizedMessage } from './api-helpers';

import { buildPermissionCache, isGroupRequirementMet, PermissionCache, PermissionRequirement } from './auth-permission-checks';

import { getRolesByName, getRolesByUserId } from './data/permissions';
import { prettifyError, ZodType } from 'zod/v4';
import { findFirstUser } from './data/users';
import { verifySecretHeader } from './server/verifySecretHeader';

export type LabeledRequirements = {
  [label: string]: PermissionRequirement | PermissionRequirement[];
};

/**
 * Defines the structure for structural route guarding.
 * Supports logical groupings (`AllOf`, `AnyOf`, `Passthrough`) or flat key-value requirements.
 * * @example
 * **Flat Structure (Implicit AllOf):**
 * ```ts
 * const requirements = {
 * canView: { action: 'read', resource: 'dashboard' }
 * } satisfies GuardRequirement;
 * ```
 * * @example
 * **Grouped Structure:**
 * ```ts
 * const requirements = {
 * AllOf: [{ isUser: { role: 'user' } }],
 * AnyOf: [{ isManager: { role: 'manager' } }, { isAdmin: { role: 'admin' } }],
 * Passthrough: [{ featureFlag: { flag: 'beta-ui' } }]
 * } satisfies GuardRequirement;
 * ```
 */
export type GuardRequirement =
  | {
      AllOf?: LabeledRequirements[];
      AnyOf?: LabeledRequirements[];
      Passthrough?: LabeledRequirements[];
    }
  | LabeledRequirements;

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type PermissionResult<T> = {
  [K in keyof UnionToIntersection<ExtractLabels<T>>]: boolean;
};

// A helper to flatten the labels from a nested GuardRequirement
export type ExtractLabels<T> = T extends { AllOf?: unknown } | { AnyOf?: unknown } | { Passthrough?: unknown }
  ?
      | (T extends { AllOf: Array<infer U> } ? U : never)
      | (T extends { AnyOf: Array<infer U> } ? U : never)
      | (T extends { Passthrough: Array<infer U> } ? U : never)
  : T;


/**
 * Protects Next.js App Router API routes by evaluating user sessions/tokens against explicit permission structures.
 * Automatically handles JSON/Query validation via an optional Zod schema before executing the route handler.
 * @template T - The structure of the guard requirement.
 * @template S - The inferred type of the optional Zod schema data.
 * @param req - The incoming NextJS server request object.
 * @param groupedRequirements - The validation requirements matching the `GuardRequirement` format. Use `satisfies GuardRequirement` or `const` assertions for Intellisense.
 * @param handler - The core handler function executed only if authentication and authorization succeed.
 * @param schema - An optional Zod schema to validate incoming `req.json()` or `searchParams`.
 * @returns A NextJS `Response` object .
 * @example
 * ```ts
 * export async function POST(req: NextRequest) {
 * return guardRoute(
 * req,
 * { canWrite: { action: 'create', resource: 'billing' } },
 * async ({ permissions, data }) => {
 * // permissions.canWrite is available here as a boolean
 * // data is type-safe and validated against your Zod schema
 * return SuccessMessage("Success",data);
 * },
 * UpdateBillingSchema //Zod v4 Schema (optional)
 * );
 * }
 * ```
 */
export async function guardRoute<const T extends GuardRequirement, S = undefined>(
  req: NextRequest,
  groupedRequirements: T,

  handler: (args: {
    sessionUserId: number;
    sessionUserEmail: string | null;
    permissionCache: PermissionCache;
    permissions: PermissionResult<T>;
    sessionId: number | null;
    data: S;
  }) => Promise<Response>,
  schema?: ZodType<S>,
): Promise<Response> {
  if (!process.env.DATABASE_PROVIDER) {
    return InternalServerErrorMessage('DATABASE_PROVIDER Missing');
  }

  let user = await getUserFromRequest(req);

  if (!user && verifySecretHeader(req)) {
    user = await getSystemUser();
  }

  if (!user) {
    return UnauthorizedMessage();
  }

  const permissionCache = buildPermissionCache(user.roles);

  const { authorized, permissions, unauthorizedMessages } = await evaluateGuard(permissionCache, groupedRequirements);

  if (!authorized) {
    return ForbiddenMessage(`Missing permissions: ${unauthorizedMessages.join(', ')}`);
  }

  let validatedData = undefined;

  const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

  if (!!schema) {
    let rawData;
    if (hasBody) {
      try {
        rawData = await req.json();
      } catch {
        return BadRequestMessage('Invalid JSON body');
      }
    } else {
      // Optional: Pull from searchParams for GET requests
      rawData = Object.fromEntries(req.nextUrl.searchParams);
    }

    const result = schema.safeParse(rawData);
    if (!result.success) {
      return BadRequestMessage('Validation Failed: ' + prettifyError(result.error));
    }
    validatedData = result.data;
  }

  return handler({
    permissionCache,
    permissions,
    sessionId: user.sessionId,
    sessionUserId: user.userId,
    sessionUserEmail: user.email,
    data: validatedData as S,
  });
}

async function getUserFromRequest(
  req: NextRequest,
): Promise<{ userId: number; roles: Role[]; sessionId: number | null; email: string | null } | null> {
  const session = await getServerSession();
  if (!session) return null;

  return { userId: Number(session.user.id), roles: session.user.roles, sessionId: Number(session.session?.id), email: session.user.email };
}

async function getSystemUser(): Promise<{ userId: number; roles: Role[]; sessionId: number | null; email: string | null } | null> {
  const systemUser = await findFirstUser({ id: 0 });

  if (!systemUser) return null;

  const adminRole = await getRolesByName('admin');

  return { userId: systemUser.userId, roles: adminRole, sessionId: null, email: null };
}


/**
 * Manually evaluates a complex guard configuration against a pre-built permission cache.
 * Useful outside of HTTP routing contexts (e.g., WebSockets, background jobs, or internal service layers).
 * * @template T - The structure of the guard requirement.
 * @param cache - The current user's generated PermissionCache mapping.
 * @param req - The `GuardRequirement` ruleset to test.
 * * @returns An object containing:
 * - `authorized`: Boolean state if the logical requirements passed.
 * - `permissions`: A key-boolean map for all specific labels evaluated.
 * - `unauthorizedMessages`: Array of string descriptive errors for failed permissions.
 */
export async function evaluateGuard<T extends GuardRequirement>(
  cache: PermissionCache,
  req: T,
): Promise<{ authorized: boolean; permissions: PermissionResult<T>; unauthorizedMessages: string[] }> {
  const formattedRequirements = formatPermissionStructure(req);

  const permissions: Record<string, boolean> = {};
  const messages: string[] = [];

  let allOfPassed = true;
  if (formattedRequirements.AllOf) {
    const { groupPermissions, outcomes } = await evaluateGroups(cache, formattedRequirements.AllOf, 'AND');

    Object.assign(permissions, groupPermissions);

    for (const o of outcomes) {
      if (!o.passed) {
        allOfPassed = false;
        messages.push(...o.messages);
      }
    }
  }

  let anyOfPassed = true;
  if (formattedRequirements.AnyOf) {
    const { groupPermissions, outcomes } = await evaluateGroups(cache, formattedRequirements.AnyOf, 'OR');
    Object.assign(permissions, groupPermissions);

    anyOfPassed = outcomes.length !== 0 || outcomes.some((o) => o.passed);

    if (!anyOfPassed) {
      outcomes.forEach((o) => messages.push(...o.messages));
    }
  }

  if (formattedRequirements.Passthrough) {
    const { groupPermissions } = await evaluateGroups(cache, formattedRequirements.Passthrough, 'OR');
    Object.assign(permissions, groupPermissions);
  }

  return {
    authorized: allOfPassed && anyOfPassed,
    permissions: permissions as PermissionResult<T>,
    unauthorizedMessages: [...new Set(messages)],
  };
}

type Outcome = { passed: boolean; messages: string[] };

async function evaluateGroups(
  cache: PermissionCache,
  groups: LabeledRequirements[],
  mode: 'AND' | 'OR',
): Promise<{ groupPermissions: Record<string, boolean>; outcomes: Outcome[] }> {
  if (!groups?.length) return { groupPermissions: {}, outcomes: [] };

  const evaluations = await Promise.all(groups.map((g) => isGroupRequirementMet(cache, g)));

  const processedGroups: Record<string, boolean> = {};
  const outcomes: Outcome[] = [];

  for (const { byGroup, unauthorizedMessages } of evaluations) {
    Object.assign(processedGroups, byGroup);

    const values = Object.values(byGroup);
    const passed = mode === 'AND' ? values.every(Boolean) : values.some(Boolean);

    outcomes.push({ passed, messages: unauthorizedMessages });
  }

  return { groupPermissions: processedGroups, outcomes };
}

type FormattedRequirement = {
  AllOf?: LabeledRequirements[];
  AnyOf?: LabeledRequirements[];
  Passthrough?: LabeledRequirements[];
};

function formatPermissionStructure<T extends GuardRequirement>(requirements: T): FormattedRequirement {
  const isGroupedRequirement =
    typeof requirements === 'object' &&
    requirements !== null &&
    (Object.prototype.hasOwnProperty.call(requirements, 'AllOf') ||
      Object.prototype.hasOwnProperty.call(requirements, 'AnyOf') ||
      Object.prototype.hasOwnProperty.call(requirements, 'Passthrough'));

  if (isGroupedRequirement) {
    return {
      AllOf: requirements.AllOf,
      AnyOf: requirements.AnyOf,
      Passthrough: requirements.Passthrough,
    } as FormattedRequirement;
  }

  return { AllOf: [requirements as LabeledRequirements] };
}
