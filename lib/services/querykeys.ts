import { TConfigurationKeys } from '../types';

export const queryKeys = {
  configuration: {
    all: ['configuration'] as const,
    lists: () => [...queryKeys.configuration.all, 'list'] as const,
    filtered: (keys?: TConfigurationKeys[]) => [...queryKeys.configuration.lists(), { keys }] as const,
    detail: (key: string) => [...queryKeys.configuration.all, 'detail', key] as const,
  },

  permissions: {
    all: ['permissions'] as const,
    sets: () => [...queryKeys.permissions.all, 'sets'] as const,
    roles: () => [...queryKeys.permissions.all, 'roles'] as const,
    list: (type: 'none' | 'existing') => [...queryKeys.permissions.roles(), type] as const,
    usersByRole: () => [...queryKeys.permissions.all, 'users-by-role'] as const,
    userByRole: (roleId?: string) => [...queryKeys.permissions.usersByRole(), roleId] as const,
  },

  public: {
    all: ['public'] as const,
    configuration: () => [...queryKeys.public.all, 'configuration'] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    profile: (id: string | undefined) => ['user_profile', id],
    details: () => ['user'] as const,
    detail: (id: number | undefined) => [...queryKeys.users.details(), id] as const,
    events: (userId?: string) => [...queryKeys.users.all, 'events', userId] as const,
  },
} as const;
