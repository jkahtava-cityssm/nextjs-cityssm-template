'use server';


import { PUBLIC_ICONFIGURATION} from '../services/public';
import { privateServerGET } from '../fetch-server';


// 3. GET with specific revalidation and tags
export async function fetchPublicConfiguration() {
  return privateServerGET<{ data: PUBLIC_ICONFIGURATION; message: string }>(
    '/api/public/configuration',
    {}, // no params
    1440,
    ["public_config"],
  );
}
