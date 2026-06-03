import { normalizeAccessTokenForStorage } from './access-token-header';

export function extractAccessTokenFromResponse(response) {
  const headers = response?.headers ?? {};
  const authHeader = headers.authorization || headers.Authorization || '';
  const xAccessToken = headers['x-access-token'] || headers['X-Access-Token'] || '';

  const bearer = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : authHeader;

  const accessTokenFromHeader = bearer || xAccessToken;
  const body = response?.data;

  const accessTokenFromBody = body?.accessToken
    || body?.access
    || body?.data?.accessToken
    || '';

  return normalizeAccessTokenForStorage(
    accessTokenFromHeader || accessTokenFromBody || '',
  );
}
