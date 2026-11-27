import { AUTH_CLEARED_EVENT, clearAuthSession, getAccessToken, setAccessToken } from '../utils/tokens';

import { refreshAccessToken } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

// 여러 요청이 동시에 401 을 받아도 재발급은 한 번만 보낸다
let reissuePromise = null;
// 로그아웃(인증 정리)할 때마다 올린다. 그 전에 보낸 재발급의 결과는 쓰지 않는다
let authGeneration = 0;

if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_CLEARED_EVENT, () => {
    authGeneration += 1;
  });
}

/** @returns {Promise<{ accessToken: string, isRejected: boolean }>} */
function reissueAccessToken() {
  if (!reissuePromise) {
    const generation = authGeneration;
    reissuePromise = refreshAccessToken()
      .then(({ accessToken, isRejected = false }) => {
        // 기다리는 동안 로그아웃했으면, 받은 토큰을 저장해 로그인 상태를 되살리지 않는다
        if (generation !== authGeneration) {
          return { accessToken: '', isRejected: false };
        }
        if (accessToken) {
          setAccessToken(accessToken);
        }
        return { accessToken, isRejected };
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
    const { accessToken, isRejected } = await reissueAccessToken();
    if (accessToken) {
      res = await request(path, options);
    } else if (isRejected) {
      // 서버가 재발급을 거부했으면 로그인이 풀린 것이므로 로그인 화면으로 보낸다.
      // 일시적인 장애(네트워크, 5xx)에서는 진행 중인 러닝 정보까지 지우지 않도록 세션을 유지한다
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
