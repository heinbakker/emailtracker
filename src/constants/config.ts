export const AUTH_ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
} as const;

export const INVITE_CODE_LENGTH = 8;
export const INVITE_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const ERROR_MESSAGES = {
  INVALID_INVITE: 'Invalid invite code',
  MISSING_ENV: 'Missing environment variables',
  AUTH_REQUIRED: 'Authentication required',
} as const;