import { GroupedPermissionRequirement } from '../auth-permission-checks';
import { createServerSecurity } from '../auth-permission-security-server';

const NAVIGATION_PERMISSIONS = {
  Authenticated: {type: "role", role: "Private"},
  EditPermissions: { type: 'permission', resource: 'Settings', action: 'Edit Permissions' },
  EditConfiguration: { type: 'permission', resource: 'Settings', action: 'Edit Configuration' },
  EditUsers: { type: 'permission', resource: 'Settings', action: 'Edit Users' },
} as const satisfies GroupedPermissionRequirement;

export const ServerNavigationPermissions = createServerSecurity(NAVIGATION_PERMISSIONS);
