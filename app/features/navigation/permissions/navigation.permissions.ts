import { GroupedPermissionRequirement } from '@/lib/auth-permission-checks';
import { createClientSecurity } from '@/lib/auth-permission-security-client';

const PAGE_PERMISSIONS = {
  EditPermissions: { type: 'permission', resource: 'Settings', action: 'Edit Permissions' },
  EditConfiguration: { type: 'permission', resource: 'Settings', action: 'Edit Configuration' },
  EditUsers: { type: 'permission', resource: 'Settings', action: 'Edit Users' },
} as const satisfies GroupedPermissionRequirement;

export const NavigationPermissions = createClientSecurity(PAGE_PERMISSIONS);
