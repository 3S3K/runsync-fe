import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { exchangeKakaoCode } from '../../api/auth';
import { consumeOauthState } from '../../utils/oauthState';
import { setAccessToken } from '../../utils/tokens';
import styles from './KakaoCallbackPage.module.css';

export default function KakaoCallbackPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  // 인가 코드는 한 번만 쓸 수 있다. 개발 모드(StrictMode)에서 effect가 두 번 실행돼도 교환은 한 번만 한다
  const hasRequestedRef = useRef(false);

  const code = useMemo(() => searchParams.get('code') || '', [searchParams]);
  const stateFromQuery = useMemo(() => searchParams.get('state') || '', [searchParams]);

  useEffect(() => {
    const run = async () => {
      if (!code) {
        setError('인가 코드(code)가 없어요.');
        return;
      }

      if (hasRequestedRef.current) {
        return;
      }
      hasRequestedRef.current = true;

      const expectedState = consumeOauthState();
      if (expectedState && stateFromQuery && expectedState !== stateFromQuery) {
        setError('state 값이 일치하지 않아요. 다시 로그인 해주세요.');
        return;
      }

      try {
        const redirectUri = process.env.REACT_APP_KAKAO_REDIRECT_URI;
        if (!redirectUri) {
          setError('REACT_APP_KAKAO_REDIRECT_URI 환경변수가 필요해요.');
          return;
        }

        const { accessToken } = await exchangeKakaoCode({ code, redirectUri });
        if (!accessToken) {
          setError('access token을 받지 못했어요.');
          return;
        }

        setAccessToken(accessToken);
        // App 은 시작할 때만 로그인 여부를 확인하므로, 새로 불러와서 인증 상태를 반영한다
        window.location.replace('/');
      } catch (e) {
        setError(e?.message || '로그인 처리 중 오류가 발생했어요.');
      }
    };

    run();
  }, [code, stateFromQuery]);

  return (
    <main className={styles.root}>
      <div className={styles.card} role="status" aria-live="polite">
        <p className={styles.title}>카카오 로그인 처리중…</p>
        {error ? <p className={styles.error}>{error}</p> : <p className={styles.desc}>잠시만 기다려주세요.</p>}
      </div>
    </main>
  );
}

