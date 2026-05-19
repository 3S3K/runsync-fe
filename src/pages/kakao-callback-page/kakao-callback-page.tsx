import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { processKakaoCallback } from '../../utils/process-kakao-callback';

import styles from './kakao-callback-page.module.css';

export default function KakaoCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const code = useMemo(() => searchParams.get('code') || '', [searchParams]);
  const stateFromQuery = useMemo(
    () => searchParams.get('state') || '',
    [searchParams],
  );

  useEffect(() => {
    void processKakaoCallback({
      code,
      stateFromQuery,
      navigate,
      onError: setError,
    });
  }, [code, stateFromQuery, navigate]);

  return (
    <main className={styles.root}>
      <div
        className={styles.card}
        role="status"
        aria-live="polite"
      >
        <p className={styles.title}>카카오 로그인 처리중…</p>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <p className={styles.desc}>잠시만 기다려주세요.</p>
        )}
      </div>
    </main>
  );
}
