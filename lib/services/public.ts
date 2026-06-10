
import { useQuery } from '@tanstack/react-query';
import {  formatISO } from 'date-fns';
import { z } from 'zod';
import { fetchPublicConfiguration } from '../server/public';
import { QueryError } from '@/contexts/ReactQueryProvider';
import { queryKeys } from './querykeys';


const PUBLIC_SCONFIGURATION = z.object({
  hours: z.object({
    from: z.number(),
    to: z.number(),
  }),
  useSSO: z.union([z.boolean(), z.stringbool()]),
  interval: z.number(),
});

export type PUBLIC_ICONFIGURATION = z.infer<typeof PUBLIC_SCONFIGURATION>;


export const usePublicConfiguration = (enabled: boolean = true) =>
  useQuery({
    queryKey: queryKeys.public.configuration(),
    queryFn: async () => {
      const result = await fetchPublicConfiguration();

      const parsedResult = PUBLIC_SCONFIGURATION.safeParse(result.data);

      if (!parsedResult.success) {
        throw new QueryError('Invalid configuration data', 'usePublicConfiguration', parsedResult.error);
      }

      return parsedResult.data;
    },
    enabled: enabled,
    staleTime: 1000 * 60 * 60 * 3, // 1 hour
  });
