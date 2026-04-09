import { useSyncExternalStore } from 'react';
import type { User } from '../types/api';

type AuthSnapshot = {
  authenticated: boolean;
  user: User | null;
  admin: boolean;
  defaultRoute: string;
};

const AUTH_CHANGED_EVENT = 'auth-changed';

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

let currentSnapshot: AuthSnapshot = {
  authenticated: false,
  user: null,
  admin: false,
  defaultRoute: '/attendance',
};

function getAuthSnapshot(): AuthSnapshot {
  return currentSnapshot;
}

// Initialize snapshot
function updateSnapshot() {
  const user = getStoredUser();
  const authenticated = !!localStorage.getItem('access_token');
  const admin = user?.role === 'ADMIN';
  
  const nextSnapshot = {
    authenticated,
    user,
    admin,
    defaultRoute: admin ? '/admin' : '/attendance',
  };

  // Only update if something actually changed (shallow compare)
  if (
    nextSnapshot.authenticated !== currentSnapshot.authenticated ||
    nextSnapshot.admin !== currentSnapshot.admin ||
    JSON.stringify(nextSnapshot.user) !== JSON.stringify(currentSnapshot.user)
  ) {
    currentSnapshot = nextSnapshot;
  }
}

// Initial call
updateSnapshot();

function notifyAuthChanged(): void {
  updateSnapshot();
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

function subscribeAuth(onStoreChange: () => void): () => void {
  const handleChange = () => {
    updateSnapshot();
    onStoreChange();
  };

  window.addEventListener('storage', handleChange);
  window.addEventListener(AUTH_CHANGED_EVENT, handleChange);

  return () => {
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(AUTH_CHANGED_EVENT, handleChange);
  };
}

export function useAuth(): AuthSnapshot {
  return useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthSnapshot);
}

export function setAuthSession(accessToken: string, user: User): void {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('user', JSON.stringify(user));
  notifyAuthChanged();
}

export function clearAuth(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  notifyAuthChanged();
}
