import { createOauthState } from './oauth-state';

export function redirectToKakaoLogin() {
  const clientId = process.env.REACT_APP_KAKAO_REST_API_KEY;
  if (!clientId) {
    alert('REACT_APP_KAKAO_REST_API_KEY 환경변수가 필요해요.');
    return;
  }

  const redirectUri = process.env.REACT_APP_KAKAO_REDIRECT_URI;
  if (!redirectUri) {
    alert('REACT_APP_KAKAO_REDIRECT_URI 환경변수가 필요해요.');
    return;
  }

  const state = createOauthState();
  const url = new URL('https://kauth.kakao.com/oauth/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);

  window.location.assign(url.toString());
}
