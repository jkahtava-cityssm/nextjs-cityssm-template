import { NextResponse } from 'next/server';

import { format } from 'date-fns';

export async function CreatedMessage(message: string, data: object) {
  return NextResponse.json({ message: message, data: data }, { status: 201 }); // Created
}

export async function SuccessMessage(message: string, data: object) {
  return NextResponse.json({ message: message, data: data }, { status: 200 }); // OK
}

export async function NoContentMessage() {
  return NextResponse.json({ status: 204 }); // No Content
}

export async function DeleteMessage() {
  return NextResponse.json({ status: 204 }); // No content
}

export async function InternalServerErrorMessage(message: string = 'Internal Server Error') {
  return NextResponse.json({ message: message }, { status: 500 }); // Internal Server Error
}

export async function BadRequestMessage(message: string = 'Bad Request') {
  return NextResponse.json({ message: message }, { status: 400 }); // Bad Request
}
export async function UnauthorizedMessage() {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }); // Not Found
}
export async function ForbiddenMessage(message: string = 'Requested Resource is Forbidden') {
  return NextResponse.json({ message: message }, { status: 403 }); // Not Found
}
export async function NotFoundMessage(message: string = 'Requested Resource was not found') {
  return NextResponse.json({ message: message }, { status: 404 }); // Not Found
}

const ENV_APP_SUBFOLDER = process.env.NEXT_PUBLIC_SUBFOLDER_PATH || '';
export const APP_SUBFOLDER = ENV_APP_SUBFOLDER ? `/${ENV_APP_SUBFOLDER.replace(/^\/+|\/+$/g, '')}` : '';

export const APP_DOMAIN = process.env.NEXT_PUBLIC_BASE_URL || '';
export const APP_FULL_URL = `${APP_DOMAIN}${APP_SUBFOLDER}`;

export const ROUTES = {
  protectedRedirect: '/landing',
  publicRedirect: '/login',
} as const;

export const DEFAULT_AUTH_CALLBACK = (() => {
  const cleanRedirect = ROUTES.protectedRedirect.replace(/^\/+/, '');
  return APP_SUBFOLDER ? `${APP_SUBFOLDER}/${cleanRedirect}` : `/${cleanRedirect}`;
})();

export function formatServerURL(url: string) {
  const base = APP_FULL_URL.endsWith('/') ? APP_FULL_URL : `${APP_FULL_URL}/`;
  const cleanPath = url.replace(/^\/+/, '');

  return new URL(cleanPath, base);
}
export const formatCallbackURL = (route: string) => {
  const cleanRoute = route.replace(/^\/+/, '');
  return APP_SUBFOLDER ? `${APP_SUBFOLDER}/${cleanRoute}` : `/${cleanRoute}`;
};

export function navigateURL(date: Date | null, view: 'agenda' | 'year' | 'month' | 'week' | 'day' | 'public' | 'request' | 'all'): string {
  const path = {
    agenda: '?view=agenda',
    year: '?view=year',
    month: '?view=month',
    week: '?view=week',
    day: '?view=day',
    public: '?view=public',
    request: '?view=request',
    all: '?view=all',
  } as const;

  const baseUrl = path[view] ?? '?view=day';

  if (!date) {
    return baseUrl;
  }

  return `${baseUrl}&selectedDate=${format(date, 'yyyy-MM-dd')}`;
}
