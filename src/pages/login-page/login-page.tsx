import styles from './login-page.module.css';

import KakaoLoginButton from '../../components/kakao-login-button/kakao-login-button';

export interface LoginPageProps {
  onKakaoLogin: () => void;
}

export function LoginPage({ onKakaoLogin }: LoginPageProps) {
  return (
    <main className={styles.root}>
      <section
        className={styles.content}
        aria-label="런싱크 로그인"
      >
        <h1
          className={styles.brand}
          aria-label="RUN sync"
        >
          <span className={styles.brandRun}>RUN</span>
          <span className={styles.brandSync}>sync</span>
        </h1>

        <p className={styles.tagline}>러닝을 더 쉽게, 꾸준하게</p>

        <div className={styles.cta}>
          <KakaoLoginButton onClick={onKakaoLogin} />
        </div>
      </section>
    </main>
  );
}
