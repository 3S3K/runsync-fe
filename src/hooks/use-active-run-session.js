import { useEffect, useState } from 'react';

import { getActiveRunSession } from '../api/run-session';

/**
 * 진행 중(ACTIVE)인 러닝 세션을 마운트 시 1회 조회하는 공용 훅.
 * @returns {{
 *   active: { sessionId: number, startTime: string, artRunSessionId: number | null, distance: number } | null,
 *   status: 'loading' | 'success' | 'error',
 *   setActive: (value: object | null) => void,
 * }}
 */
export function useActiveRunSession() {
  const [active, setActive] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getActiveRunSession();
        if (!cancelled) {
          setActive(data);
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
  }, []);

  return { active, status, setActive };
}
