let inMemoryAccessToken = '';

export function setAccessToken(accessToken) {
  inMemoryAccessToken = accessToken || '';
}

export function getAccessToken() {
  return inMemoryAccessToken;
}

export function clearAccessToken() {
  inMemoryAccessToken = '';
}

