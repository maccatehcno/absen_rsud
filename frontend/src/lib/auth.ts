import type { User } from '../types/api';

export function getStoredUser(): User | null {
  const rawUser = localStorage.getItem('user');
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token');
}

export function isAdmin(): boolean {
  return getStoredUser()?.role === 'ADMIN';
}

export function getDefaultAuthenticatedRoute(): string {
  return isAdmin() ? '/admin' : '/attendance';
}

export function clearAuth(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}
