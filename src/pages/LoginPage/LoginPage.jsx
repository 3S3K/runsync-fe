import styles from './LoginPage.module.css';
import KakaoLoginButton from '../../components/KakaoLoginButton/KakaoLoginButton';
import onboardingHeroMap from '../../assets/login-onboarding-hero-map.png';
import { createOauthState } from '../../utils/oauthState';

export default function LoginPage() {
  const handleKakaoLogin = () => {
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
  };

  return (
    <main className={styles.root}>
      <section className={styles.content} aria-label="RunSync 로그인">
        <div className={styles.heroSection}>
          <img
            className={styles.heroImage}
            src={onboardingHeroMap}
            alt="8km 고구마 코스 지도 일러스트"
          />
          <div className={styles.heroFade} aria-hidden="true" />
        </div>

        <div className={styles.lowerPanel}>
          <div className={styles.brandSection}>
            <h1 className={styles.brand}>RunSync</h1>
            <p className={styles.slogan}>함께 달리고, 함께 완성하는 러닝</p>
            <div className={styles.pageIndicator} aria-hidden="true">
              <span className={`${styles.pageDot} ${styles.pageDotActive}`} />
              <span className={styles.pageDot} />
              <span className={styles.pageDot} />
            </div>
          </div>

          <footer className={styles.actionSection}>
            <KakaoLoginButton onClick={handleKakaoLogin} />
            <p className={styles.terms}>
              로그인하면 서비스 이용약관 및
              <br />
              개인정보 처리방침에 동의하게 됩니다.
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
