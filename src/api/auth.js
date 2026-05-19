const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export async function exchangeKakaoCode({ code, redirectUri }) {
  const res = await fetch(`${API_BASE_URL}/auth/kakao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code, redirectUri }),
  });

  if (!res.ok) {
    const msg = (await res.text().catch(() => '')) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // access token은 헤더로 받는 방식 우선 지원
  const authHeader = res.headers.get('authorization') || res.headers.get('Authorization') || '';
  const xAccessToken = res.headers.get('x-access-token') || res.headers.get('X-Access-Token') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : authHeader;
  const accessTokenFromHeader = bearer || xAccessToken;

  // body는 선택(백엔드가 함께 내려주는 경우 대비)
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);
  const accessTokenFromBody = body?.accessToken || body?.access || body?.data?.accessToken;

  return { accessToken: accessTokenFromHeader || accessTokenFromBody || '', body };
}

export async function refreshAccessToken() {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    return { accessToken: '' };
  }

  const authHeader = res.headers.get('authorization') || res.headers.get('Authorization') || '';
  const xAccessToken = res.headers.get('x-access-token') || res.headers.get('X-Access-Token') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : authHeader;
  const accessTokenFromHeader = bearer || xAccessToken;

  if (accessTokenFromHeader) return { accessToken: accessTokenFromHeader };

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;
  const accessTokenFromBody = body?.accessToken || body?.access || body?.data?.accessToken || '';
  return { accessToken: accessTokenFromBody };
}

