import type { SessionUser } from '../services/api';

export type AppRole = SessionUser['role'];

export const publicRoutePatterns = [
  /^\/$/,
  /^\/auth(?:\/.*)?$/,
  /^\/legal(?:\/.*)?$/,
  /^\/support(?:\/.*)?$/,
  /^\/careers$/,
  /^\/achievements$/,
] as const;

export function matchesRoute(pathname: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(pathname));
}

export function isPublicRoute(pathname: string): boolean {
  return matchesRoute(pathname, publicRoutePatterns);
}

export function requiresAdmin(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

export function requiresAdvisor(pathname: string): boolean {
  return pathname.startsWith('/agent');
}

export function requiresAuthenticatedUser(pathname: string): boolean {
  return /^\/(account|contracts|chat)/.test(pathname) || requiresAdmin(pathname) || requiresAdvisor(pathname);
}

export function canAccessPath(role: AppRole | undefined, pathname: string): boolean {
  if (isPublicRoute(pathname)) {
    return true;
  }

  if (!role) {
    return !requiresAuthenticatedUser(pathname);
  }

  if (requiresAdmin(pathname)) {
    return role === 'admin';
  }

  if (requiresAdvisor(pathname)) {
    return role === 'advisor' || role === 'admin';
  }

  if (/^\/(account|contracts|chat)/.test(pathname)) {
    return role === 'seller' || role === 'advisor' || role === 'admin';
  }

  return true;
}

export function defaultRouteForRole(role: AppRole | undefined): string {
  if (role === 'admin') {
    return '/admin';
  }

  if (role === 'advisor') {
    return '/agent/dashboard';
  }

  return '/account/profile';
}

export function personaProfile(role: AppRole, mobile: string, tokens?: { accessToken?: string; refreshToken?: string }): SessionUser {
  if (role === 'admin') {
    return {
      id: 'ops_1',
      fullName: 'نرگس صادقی',
      mobile,
      city: 'تهران',
      role: 'admin',
      membership: 'Amline Enterprise',
      accessToken: tokens?.accessToken,
      refreshToken: tokens?.refreshToken,
      actorId: 'ops_1',
      teamId: 'ops_central',
    };
  }

  if (role === 'advisor') {
    return {
      id: 'adv_21',
      fullName: 'رضا موحد',
      mobile,
      city: 'تهران',
      role: 'advisor',
      membership: 'Amline Advisor Pro',
      accessToken: tokens?.accessToken,
      refreshToken: tokens?.refreshToken,
      actorId: 'adv_21',
      teamId: 'team_north',
    };
  }

  return {
    id: 'acct_1',
    fullName: 'آراد صالحی',
    mobile,
    city: 'تهران',
    role: 'seller',
    membership: 'Amline Plus',
    accessToken: tokens?.accessToken,
    refreshToken: tokens?.refreshToken,
    actorId: 'acct_1',
    teamId: 'team_north',
  };
}
