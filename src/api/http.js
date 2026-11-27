import { clearAuthSession, getAccessToken, setAccessToken } from '../utils/tokens';

import { refreshAccessToken } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

// 여러 요청이 동시에 401 을 받아도 재발급은 한 번만 보낸다
let reissuePromise = null;

function reissueAccessToken() {
  if (!reissuePromise) {
    reissuePromise = refreshAccessToken()
      .then(({ accessToken }) => {
        if (accessToken) {
          setAccessToken(accessToken);
        }
        return accessToken;
      })
      .finally(() => {
        reissuePromise = null;
      });
  }
  return reissuePromise;
}

function request(path, { headers, ...init }) {
  const accessToken = getAccessToken();
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : null),
      ...(headers || null),
    },
  });
}

export async function apiFetch(path, options = {}) {
  let res = await request(path, options);

  // 액세스 토큰이 만료되면(401) 재발급을 받아 같은 요청을 한 번 더 보낸다
  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    const accessToken = await reissueAccessToken();
    if (accessToken) {
      res = await request(path, options);
    } else {
      // 재발급도 실패하면 로그인이 풀린 것이므로 로그인 화면으로 보낸다
      clearAuthSession();
    }
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (body && typeof body === 'object' && body.message) ||
      (typeof body === 'string' && body) ||
      `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}
