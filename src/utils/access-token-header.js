export function normalizeAccessTokenForStorage(token) {
  if (!token) return '';

  const trimmed = String(token).trim();

  if (trimmed.startsWith('Bearer ')) {
    return trimmed.slice('Bearer '.length).trim();
  }

  return trimmed;
}

export function buildAuthorizationHeader(token) {
  const normalized = normalizeAccessTokenForStorage(token);

  if (!normalized) {
    return '';
  }

  return `Bearer ${normalized}`;
}
