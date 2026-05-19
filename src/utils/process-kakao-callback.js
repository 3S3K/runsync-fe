import { exchangeKakaoCode } from '../api/auth';

import { consumeOauthState } from './oauth-state';
import { setAccessToken } from './tokens';

export async function processKakaoCallback({
  code,
  stateFromQuery,
  navigate,
  onError,
}) {
  if (!code) {
    onError('인가 코드(code)가 없어요.');
    return;
  }

  const expectedState = consumeOauthState();
  if (expectedState && stateFromQuery && expectedState !== stateFromQuery) {
    onError('state 값이 일치하지 않아요. 다시 로그인 해주세요.');
    return;
  }

  try {
    const redirectUri = process.env.REACT_APP_KAKAO_REDIRECT_URI;
    if (!redirectUri) {
      onError('REACT_APP_KAKAO_REDIRECT_URI 환경변수가 필요해요.');
      return;
    }

    const { accessToken } = await exchangeKakaoCode({ code, redirectUri });
    if (!accessToken) {
      onError('access token을 받지 못했어요.');
      return;
    }

    setAccessToken(accessToken);
    navigate('/', { replace: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했어요.';
    onError(message);
  }
}
