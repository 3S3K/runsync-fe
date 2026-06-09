import { useEffect, useState } from 'react';

import { getArtRunResult } from '../api/art-run';

/**
 * 협동 러닝 결과를 조회하는 훅. (세션 COMPLETED 일 때만 유효)
 * @param {number|string} sessionId
 * @returns {{ result: object | null, status: 'loading' | 'success' | 'error' }}
 */
export function useArtRunResult(sessionId) {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return undefined;
    }

    let cancelled = false;
    setStatus('loading');

    const load = async () => {
      try {
        const data = await getArtRunResult(sessionId);
        if (!cancelled) {
          setResult(data);
          setStatus('success');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return { result, status };
}
