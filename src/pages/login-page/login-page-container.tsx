import { redirectToKakaoLogin } from '../../utils/kakao-oauth';

import { LoginPage } from './login-page';

export default function LoginPageContainer() {
  return (
    <LoginPage onKakaoLogin={redirectToKakaoLogin} />
  );
}
