import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDistinctValuesByKey<T, K extends keyof T>(list: T[], key: K): T[K][] {
  if (!list) return [];

  return [...new Set(list.map((item) => item[key]))];
}
