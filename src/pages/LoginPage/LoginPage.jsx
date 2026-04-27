import styles from "./LoginPage.module.css";
import KakaoLoginButton from "../../components/KakaoLoginButton/KakaoLoginButton";
import { createOauthState } from "../../utils/oauthState";

export default function LoginPage() {
  const handleKakaoLogin = () => {
    const clientId = process.env.REACT_APP_KAKAO_REST_API_KEY;
    if (!clientId) {
      alert("REACT_APP_KAKAO_REST_API_KEY 환경변수가 필요해요.");
      return;
    }

    const redirectUri = process.env.REACT_APP_KAKAO_REDIRECT_URI;
    if (!redirectUri) {
      alert("REACT_APP_KAKAO_REDIRECT_URI 환경변수가 필요해요.");
      return;
    }

    const state = createOauthState();
    const url = new URL("https://kauth.kakao.com/oauth/authorize");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);

    window.location.assign(url.toString());
  };

  return (
    <main className={styles.root}>
      <section className={styles.content} aria-label="런싱크 로그인">
        <h1 className={styles.brand} aria-label="RUN sync">
          <span className={styles.brandRun}>RUN</span>
          <span className={styles.brandSync}>sync</span>
        </h1>

        <p className={styles.tagline}>러닝을 더 쉽게, 꾸준하게</p>

        {/* <div className={styles.illustrationWrap} aria-hidden="true">
          <img className={styles.illustration} src={loginIllustration} alt="" />
        </div> */}

        <div className={styles.cta}>
          <KakaoLoginButton onClick={handleKakaoLogin} />
        </div>
      </section>
    </main>
  );
}
