import { useCallback, useEffect, useState } from 'react';

import {
  deleteArtRun,
  getArtRun,
  joinArtRun,
  leaveArtRun,
  updateArtRunStatus,
} from '../api/art-run';
import { getMe } from '../api/user';

/**
 * 협동 러닝 상세 + 내 정보(역할 판정) + 액션을 관리하는 훅.
 * @param {number|string} sessionId
 * @returns {{
 *   artRun: object | null,
 *   me: object | null,
 *   status: 'loading' | 'success' | 'error',
 *   error: string | null,
 *   isProcessing: boolean,
 *   join: () => Promise<void>,
 *   leave: () => Promise<void>,
 *   changeStatus: (status: string) => Promise<void>,
 *   remove: () => Promise<void>,
 *   reload: () => void,
 * }}
 */
export function useArtRun(sessionId) {
  const [artRun, setArtRun] = useState(null);
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setStatus('loading');
    }
    try {
      const detail = await getArtRun(sessionId);
      setArtRun(detail);
      setError(null);
      setStatus('success');
    } catch {
      setError('협동 러닝 정보를 불러오지 못했어요.');
      setStatus('error');
    }
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  // 내 정보는 마운트 시 1회만 조회 (역할 판정용 — 액션 재조회와 분리, 실패해도 상세는 정상)
  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((data) => {
        if (!cancelled) {
          setMe(data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // 액션 실행 → 콘텐츠 유지한 채 재조회 (로딩 화면 깜빡임 방지), 처리 중 가드
  const runWithReload = useCallback(async (action) => {
    setIsProcessing(true);
    try {
      await action();
      await load(false);
    } finally {
      setIsProcessing(false);
    }
  }, [load]);

  const join = useCallback(
    () => runWithReload(() => joinArtRun(sessionId)),
    [runWithReload, sessionId],
  );
  const leave = useCallback(
    () => runWithReload(() => leaveArtRun(sessionId)),
    [runWithReload, sessionId],
  );
  const changeStatus = useCallback(
    (next) => runWithReload(() => updateArtRunStatus(sessionId, next)),
    [runWithReload, sessionId],
  );

  const remove = useCallback(async () => {
    setIsProcessing(true);
    try {
      await deleteArtRun(sessionId);
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId]);

  return { artRun, me, status, error, isProcessing, join, leave, changeStatus, remove, reload: load };
}
