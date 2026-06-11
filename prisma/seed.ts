import { Action, PrismaClient, Resource, ResourceAction, Role } from '@prisma/client';
import {
  CONFIG_MANIFEST,
  DEFAULT_PERMISSION_SETS,
  DEFAULT_RESOURCE_ACTIONS,
  DEFAULT_USER_ROLES,
  SessionAction,
  SessionResource,
  SessionRole,
  TConfigurationKeys,
} from '../lib/types';

import { DOMAINS, FIRST_NAMES, LAST_NAMES } from './seed-data';

import dynamicIconImports from 'lucide-react/dynamicIconImports';

type IconName = keyof typeof dynamicIconImports;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_PROVIDER === 'sqlserver' ? process.env.DATABASE_URL_SQLSERVER : process.env.DATABASE_URL_POSTGRESQL, // e.g., regular user
    },
  },
});

const DATABASE_NAME = process.env.DATABASE_NAME || 'Unknown';

async function FindCreateActionList() {
  const DEFAULT_ACTIONS = Array.from(new Set(DEFAULT_RESOURCE_ACTIONS.flatMap((r) => r.ACTIONS))) as readonly SessionAction[];

  const actionList: Record<SessionAction, Action> = {} as Record<SessionAction, Action>;

  for (const action of DEFAULT_ACTIONS) {
    actionList[action] = await FindCreateAction(action);
  }

  return actionList;
}

async function FindCreateAction(name: string): Promise<Action> {
  let record = await prisma.action.findFirst({ where: { name: name }, orderBy: { actionId: 'asc' } });

  if (!record) {
    record = await prisma.action.create({ data: { name: name, createdBy: 0, updatedBy: 0 } });
  }

  return record;
}

async function FindCreateRoleList() {
  const roleList: Record<SessionRole, Role> = {} as Record<SessionRole, Role>;

  for (const role of DEFAULT_USER_ROLES) {
    if (role === 'Public' || role === 'Private') continue;

    roleList[role] = await FindCreateRole(role);
  }
  return roleList;
}

async function FindCreateRole(name: string): Promise<Role> {
  let record = await prisma.role.findFirst({ where: { name: name } });

  if (!record) {
    record = await prisma.role.create({ data: { name: name, createdBy: 0, updatedBy: 0 } });
  }

  return record;
}

async function FindCreateResourceList() {
  const DEFAULT_RESOURCES = Array.from(new Set(DEFAULT_RESOURCE_ACTIONS.flatMap((r) => r.RESOURCE))) as readonly SessionResource[];

  const resourceList: Record<SessionResource, Resource> = {} as Record<SessionResource, Resource>;

  for (const resource of DEFAULT_RESOURCES) {
    resourceList[resource] = await FindCreateResource(resource);
  }
  return resourceList;
}

async function FindCreateResource(name: string): Promise<Resource> {
  let record = await prisma.resource.findFirst({ where: { name: name }, orderBy: { resourceId: 'asc' } });

  if (!record) {
    record = await prisma.resource.create({ data: { name: name, createdBy: 0, updatedBy: 0 } });
  }

  return record;
}

async function FindCreateResourceActionList(resourceList: Record<SessionResource, Resource>, actionList: Record<SessionAction, Action>) {
  const resourceActionList: Record<string, Record<string, ResourceAction>> = {} as Record<string, Record<string, ResourceAction>>;

  for (const resourceAction of DEFAULT_RESOURCE_ACTIONS) {
    const resourceId = resourceList[resourceAction.RESOURCE].resourceId;
    resourceActionList[resourceAction.RESOURCE] = {};

    for (const actionName of resourceAction.ACTIONS) {
      const actionId = actionList[actionName].actionId;
      resourceActionList[resourceAction.RESOURCE][actionName] = await FindCreateResourceActionRecord(resourceId, actionId);
    }
  }
  return resourceActionList;
}

async function FindCreateResourceActionRecord(resourceId: number, actionId: number): Promise<ResourceAction> {
  let record = await prisma.resourceAction.findFirst({
    where: { resourceId: resourceId, actionId: actionId },
  });

  if (!record) {
    record = await prisma.resourceAction.create({
      data: { resourceId: resourceId, actionId: actionId, createdBy: 0, updatedBy: 0 },
    });
  }

  return record;
}

async function FindCreateRoleResourceAction(roleId: number, resourceActionId: number, permit: boolean) {
  let record = await prisma.roleResourceAction.findFirst({
    where: { roleId: roleId, resourceActionId: resourceActionId },
    orderBy: { roleResourceActionId: 'asc' },
  });

  if (!record) {
    record = await prisma.roleResourceAction.create({
      data: { roleId: roleId, resourceActionId: resourceActionId, permit: permit, createdBy: 0, updatedBy: 0 },
    });
  }

  return record;
}

async function FindCreatePermissionSet(role: Role, resourceAction: ResourceAction) {
  const roleResourceAction = await FindCreateRoleResourceAction(role.roleId, resourceAction.resourceActionId, true);

  return {
    roleResourceAction,
  };
}

const getRandom = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

async function CreateRandomUsers(count: number) {
  const createdUsers = [];

  for (let i = 0; i < count; i++) {
    const firstName = getRandom(FIRST_NAMES);
    const lastName = getRandom(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;

    // Create a semi-unique email by appending a random number
    const randomID = Math.floor(Math.random() * 10000);
    const email = `${firstName}.${lastName}${randomID}@${getRandom(DOMAINS)}`;

    const user = await findCreateUser({
      name: fullName,
      email: email,

      employeeNumber: Math.floor(10000 + Math.random() * 90000).toString(),
      emailVerified: Math.random() > 0.5,
      employeeActive: true,
    });

    createdUsers.push(user);
  }

  return createdUsers;
}
async function findCreateUser(userData: {
  email: string;
  name: string;
  employeeNumber: string;
  emailVerified?: boolean;
  image?: string | null;
  employeeActive?: boolean;
}) {
  let user = await prisma.user.findFirst({
    where: { email: userData.email },
  });

  // 2. If not found, create them
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        emailVerified: userData.emailVerified ?? false,
        image: userData.image ?? null,
        externalId: userData.employeeNumber,
        isActive: userData.employeeActive ?? true,
        timezone: process.env.DEFAULT_TIMEZONE || 'America/Toronto',
        createdBy: 0,
        updatedBy: 0,
      },
    });
  }

  return user;
}

async function FindCreateUserRole(roleId: number, userId: number) {
  let record = await prisma.userRole.findFirst({
    where: { roleId: roleId, userId: userId },
  });

  if (!record) {
    record = await prisma.userRole.create({
      data: { roleId: roleId, userId: userId, createdBy: 0, updatedBy: 0 },
    });
  }

  return record;
}

async function FindCreateConfigurationSetting(key: TConfigurationKeys, name: string, description: string, value: string, type: string) {
  let record = await prisma.configuration.findFirst({
    where: { key: key },
  });

  if (!record) {
    record = await prisma.configuration.create({
      data: { key: key, name: name, description: description, value: value, type: type, createdBy: 0, updatedBy: 0 },
    });
  }
  return record;
}

async function getActiveUsers(): Promise<{ id: number }[]> {
  const result = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
    orderBy: { id: 'asc' },
  });

  return result;
}

export async function saveSystemProcess({
  pid,
  parameter,
  processTag,
  processKey,
  userId = 0,
}: {
  pid: number;
  parameter: string;
  processTag: string;
  processKey: string;
  userId?: number;
}) {
  try {
    const process = await prisma.systemProcess.upsert({
      create: { pid, key: processKey, tag: processTag, parameter: parameter, createdBy: userId, updatedBy: userId },
      update: { pid, parameter: parameter, updatedBy: userId },
      where: { key: processKey },
      select: { pid: true, tag: true, updatedAt: true },
    });

    return process;
  } catch (err) {
    console.error('[Scheduler] Failed to save metadata:', err);
  }
}

async function deleteAllData() {
  await prisma.roleResourceAction.deleteMany();
  await prisma.resourceAction.deleteMany();

  await prisma.userRole.deleteMany();
  await prisma.sSOProvider.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();

  await prisma.role.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.action.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.configuration.deleteMany();

  await prisma.user.deleteMany({ where: { NOT: { id: 0 } } });
}

async function createSystemUser() {
  const userId = 0;

  if (process.env.DATABASE_PROVIDER === 'sqlserver') {
    // SQL Server: Needs the IDENTITY_INSERT toggle wrap
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET IDENTITY_INSERT "User" ON`);

      // We use a raw query here because Prisma's upsert generates
      // internal logic that often conflicts with IDENTITY_INSERT settings
      await tx.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT 1 FROM "User" WHERE user_id = ${userId})
      INSERT INTO "User" (user_id, name, email, email_verified, external_id, is_active)
      VALUES (${userId}, 'SYSTEM', '', 0, '000', 0)
    `);

      await tx.$executeRawUnsafe(`SET IDENTITY_INSERT "User" OFF`);
    });

    // Fetch the result to keep the return type consistent
    return prisma.user.findUnique({ where: { id: userId } });
  } else {
    // Postgres (and others): Standard Prisma Upsert works perfectly
    return await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: 'SYSTEM',
        email: '',
        externalId: '000',
        emailVerified: false,
        isActive: false,
      },
    });
  }
}

async function main() {
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
    console.log('Deleting All Data...');
    await deleteAllData();
  }

  console.log('Creating System User...');
  await createSystemUser();

  if (process.env.ADMIN_USER_EMAIL) {
    const adminUser = await findCreateUser({
      email: process.env.ADMIN_USER_EMAIL,
      name: 'Admin User',
      employeeNumber: '000',
      emailVerified: true,
      employeeActive: true,
    });

    const adminRole = await FindCreateRole('Admin');
    await FindCreateUserRole(adminRole.roleId, adminUser.id);
  }

  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
    console.log('Seeding Random Users...');
    //await prisma.user.deleteMany({ where: { NOT: { id: 0 } } });
    CreateRandomUsers(50);
  }

  const actions = await FindCreateActionList();
  const resources = await FindCreateResourceList();
  const resourceActions = await FindCreateResourceActionList(resources, actions);
  const roles = await FindCreateRoleList();
  console.log('Seeding Permission Sets...');
  for (const roleSet of DEFAULT_PERMISSION_SETS) {
    const role = roles[roleSet.ROLE];
    for (const resourceSet of roleSet.SET) {
      for (const actionName of resourceSet.ACTIONS) {
        const resourceAction = resourceActions[resourceSet.RESOURCE][actionName];
        await FindCreatePermissionSet(role, resourceAction);
      }
    }
  }

  for (const config of CONFIG_MANIFEST) {
    await FindCreateConfigurationSetting(config.key, config.name, config.description, String(config.defaultValue), config.type);
  }

  const roomList: {
    roomId: number;
    name: string;
    color: string;
    icon: string | null;
    publicFacing: boolean;
    createdAt: Date;
    updatedAt: Date;
    roomCategoryId: number;
  }[] = [];
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
