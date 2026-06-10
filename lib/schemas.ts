import { z } from 'zod/v4';

export const utcDateSchema = z.coerce.date().transform((d) => {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()));
});

const DateSchema = z.union([z.string(), z.date().transform((d) => d.toISOString())]);

export const SUser = z.object({
  userId: z.number(),
  name: z.string(),
  email: z.string(),
  emailEnabled: z.union([z.boolean(), z.stringbool()]),
  department: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  externalId: z.string().optional().nullable(),
  isActive: z.union([z.boolean(), z.stringbool()]),
  isManaged: z.union([z.boolean(), z.stringbool()]),
  timezone: z.string().nullable(),
});

export type IUser = z.infer<typeof SUser>;

