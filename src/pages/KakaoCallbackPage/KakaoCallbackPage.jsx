import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeKakaoCode } from '../../api/auth';
import { consumeOauthState } from '../../utils/oauthState';
import { setAccessToken } from '../../utils/tokens';
import styles from './KakaoCallbackPage.module.css';

export default function KakaoCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const code = useMemo(() => searchParams.get('code') || '', [searchParams]);
  const stateFromQuery = useMemo(() => searchParams.get('state') || '', [searchParams]);

  useEffect(() => {
    const run = async () => {
      if (!code) {
        setError('인가 코드(code)가 없어요.');
        return;
      }

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
        navigate('/', { replace: true });
      } catch (e) {
        setError(e?.message || '로그인 처리 중 오류가 발생했어요.');
      }
    };

    run();
  }, [code, stateFromQuery, navigate]);

  return (
    <main className={styles.root}>
      <div className={styles.card} role="status" aria-live="polite">
        <p className={styles.title}>카카오 로그인 처리중…</p>
        {error ? <p className={styles.error}>{error}</p> : <p className={styles.desc}>잠시만 기다려주세요.</p>}
      </div>
    </main>
  );
}

