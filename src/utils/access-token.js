import { getAccessToken, hasAuthSessionMarker } from './tokens';

export function getStoredAccessToken() {
  const token = getAccessToken();
  return token || null;
}

export function hasStoredAccessToken() {
  return Boolean(getStoredAccessToken());
}

export function canAttemptTokenReissue() {
  return hasStoredAccessToken() || hasAuthSessionMarker();
}
