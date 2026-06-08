import { normalizeAccessTokenForStorage } from './access-token-header';
import { clearActiveRunSession } from './run-session-store';

const AUTH_SESSION_KEY = 'authSessionActive';
export const AUTH_CLEARED_EVENT = 'runsync:auth-cleared';

let inMemoryAccessToken = '';

export function setAccessToken(accessToken) {
  const normalizedToken = normalizeAccessTokenForStorage(accessToken);
  inMemoryAccessToken = normalizedToken;

  if (normalizedToken) {
    localStorage.setItem('accessToken', normalizedToken);
  } else {
    localStorage.removeItem('accessToken');
  }
}

export function getAccessToken() {
  if (inMemoryAccessToken) {
    return inMemoryAccessToken;
  }

  return normalizeAccessTokenForStorage(
    localStorage.getItem('accessToken') || '',
  );
}

export function markAuthSessionActive() {
  sessionStorage.setItem(AUTH_SESSION_KEY, '1');
}

export function hasAuthSessionMarker() {
  return sessionStorage.getItem(AUTH_SESSION_KEY) === '1';
}

export function clearAccessToken() {
  inMemoryAccessToken = '';
  localStorage.removeItem('accessToken');
}

export function clearAuthSession() {
  clearAccessToken();
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  clearActiveRunSession();
  window.dispatchEvent(new CustomEvent(AUTH_CLEARED_EVENT));
}
