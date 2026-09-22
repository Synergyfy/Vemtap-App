import type { Session } from '@api/authApi';

export type AuthUser = Session['user'];

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';
