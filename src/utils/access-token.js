import { getAccessToken, hasAuthSessionMarker } from './tokens';

const EXPIRY_SKEW_SECONDS = 30; // 시계 오차·만료 임박분 갱신 여유

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getStoredAccessToken() {
  const token = getAccessToken();
  return token || null;
}

export function hasStoredAccessToken() {
  return Boolean(getStoredAccessToken());
}

/**
 * access token(JWT)이 아직 유효한지(만료 전인지) 검사한다.
 * exp가 없으면 판단할 수 없으므로 일단 유효한 것으로 보고 서버 401에 맡긴다.
 * @param {string} token
 * @returns {boolean}
 */
export function isAccessTokenValid(token) {
  if (!token) {
    return false;
  }
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    return true;
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > nowSeconds + EXPIRY_SKEW_SECONDS;
}

export function canAttemptTokenReissue() {
  return hasStoredAccessToken() || hasAuthSessionMarker();
}
