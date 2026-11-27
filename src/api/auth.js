const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
const LOGOUT_TIMEOUT_MS = 3000;

export async function exchangeKakaoCode({ code, redirectUri }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code, redirectUri }),
  });

  if (!res.ok) {
    const msg = (await res.text().catch(() => "")) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // access token은 헤더로 받는 방식 우선 지원
  const authHeader =
    res.headers.get("authorization") || res.headers.get("Authorization") || "";
  const xAccessToken =
    res.headers.get("x-access-token") ||
    res.headers.get("X-Access-Token") ||
    "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : authHeader;
  const accessTokenFromHeader = bearer || xAccessToken;

  // body는 선택(백엔드가 함께 내려주는 경우 대비)
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);
  const accessTokenFromBody =
    body?.accessToken || body?.access || body?.data?.accessToken;

  return {
    accessToken: accessTokenFromHeader || accessTokenFromBody || "",
    body,
  };
}

export async function refreshAccessToken() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/reissue`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      // 4xx 는 서버가 재발급을 거부한 것(로그인 만료), 5xx 는 일시적인 장애로 본다
      return { accessToken: "", isRejected: res.status >= 400 && res.status < 500 };
    }

    const authHeader =
      res.headers.get("authorization") || res.headers.get("Authorization") || "";
    const xAccessToken =
      res.headers.get("x-access-token") ||
      res.headers.get("X-Access-Token") ||
      "";
    const bearer = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : authHeader;
    const accessTokenFromHeader = bearer || xAccessToken;

    if (accessTokenFromHeader) return { accessToken: accessTokenFromHeader };

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await res.json().catch(() => null) : null;
    const accessTokenFromBody =
      body?.accessToken || body?.access || body?.data?.accessToken || "";
    return { accessToken: accessTokenFromBody };
  } catch {
    // 네트워크 오류는 로그인이 풀린 것이 아니다
    return { accessToken: "", isRejected: false };
  }
}

/** 서버의 리프레시 토큰을 지운다. 호출하지 않으면 새로고침 때 재발급으로 다시 로그인된다 */
export async function logout() {
  // 서버 응답이 늦어도 화면의 로그아웃이 막히지 않도록 대기 시간을 제한한다
  const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
    signal: AbortSignal.timeout(LOGOUT_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
}
