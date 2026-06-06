import styles from './LoginPage.module.css';
import KakaoLoginButton from '../../components/KakaoLoginButton/KakaoLoginButton';
import LoginRunnerIcon from '../../components/login/LoginRunnerIcon';
import gogumaCourseMap from '../../assets/login-goguma-course-soft.png';
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
      <div className={styles.decorLayer} aria-hidden="true">
        <span className={styles.dotGrid} />
        <span className={styles.mintArc} />
        <span className={`${styles.plusMark} ${styles.plusOne}`}>+</span>
        <span className={`${styles.plusMark} ${styles.plusTwo}`}>+</span>
        <span className={`${styles.plusMark} ${styles.plusThree}`}>+</span>
        <span className={`${styles.cloud} ${styles.cloudOne}`} />
        <span className={`${styles.cloud} ${styles.cloudTwo}`} />
      </div>

      <section className={styles.content} aria-label="런싱크 로그인">
        <header className={styles.logoSection}>
          <div className={styles.logoArea}>
            <LoginRunnerIcon className={styles.logoRunnerIcon} />
            <h1 className={styles.brand}>RunSync</h1>
          </div>

          <div className={styles.divider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerDot} />
            <span className={styles.dividerLine} />
          </div>
        </header>

        <div className={styles.copySection}>
          <p className={styles.tagline}>
            친구와 함께
            {' '}
            <span className={styles.taglineAccent}>러닝</span>
            을 완성하다
          </p>
          <p className={styles.intro}>
            실시간 위치 공유와 GPS 아트로
            <br />
            더 재미있는 러닝을 시작해보세요.
          </p>
        </div>

        <div className={styles.mapSection}>
          <div className={styles.mapBlend}>
            <img
              className={styles.mapIllustration}
              src={gogumaCourseMap}
              alt="8km 고구마 코스 GPS 아트 지도"
            />
          </div>
        </div>

        <footer className={styles.footer}>
          <KakaoLoginButton onClick={handleKakaoLogin} />
        </footer>
      </section>
    </main>
  );
}
