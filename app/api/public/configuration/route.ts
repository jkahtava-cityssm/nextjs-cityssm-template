import { findManyConfiguration } from '@/lib/data/configuration';

import { NextRequest } from 'next/server';
import { SuccessMessage, UnauthorizedMessage } from '@/lib/api-helpers';
import { verifySecretHeader } from '@/lib/server/verifySecretHeader';
import { TConfigurationKeys } from '@/lib/types';

export async function GET(request: NextRequest) {
  if (!verifySecretHeader(request)) {
    return UnauthorizedMessage();
  }

  const configEntries = await findManyConfiguration(['singleSignOnEnabled']);

  const flatMap = configEntries.reduce<Partial<Record<TConfigurationKeys, string>>>((acc, entry) => {
    const key = entry.key as TConfigurationKeys;
    acc[key] = String(entry.value);
    return acc;
  }, {});

  return SuccessMessage('Collected Public Configuration', {
    useSSO: flatMap.singleSignOnEnabled === 'true',
  });
}
