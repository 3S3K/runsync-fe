import { useEffect, useState } from 'react';

import { getRunnerSummary } from '../api/course';

/**
 * 내 러닝 분석(최근 기록 요약)을 불러오는 훅.
 * 실패해도 추천은 받을 수 있으므로 에러를 화면에 띄우지 않고 summary 를 null 로 둔다.
 * @returns {{ summary: object | null, status: 'loading' | 'success' | 'error' }}
 */
export function useRunnerSummary() {
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isActive = true;

    const loadSummary = async () => {
      try {
        const result = await getRunnerSummary();
        if (!isActive) {
          return;
        }
        setSummary(result);
        setStatus('success');
      } catch (requestError) {
        if (!isActive) {
          return;
        }
        console.error('내 러닝 분석 조회 실패', requestError);
        setStatus('error');
      }
    };
    loadSummary();

    return () => {
      isActive = false;
    };
  }, []);

  return { summary, status };
}
