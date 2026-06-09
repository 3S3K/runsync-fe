import { useCallback, useEffect, useRef, useState } from 'react';

import { getArtRuns } from '../api/art-run';

/**
 * 협동 러닝 목록 + 상태 필터 + 커서 페이지네이션을 관리하는 훅.
 * @param {string} [initialFilter] RECRUITING | IN_PROGRESS | COMPLETED
 * @returns {{
 *   sessions: Array<object>,
 *   statusFilter: string,
 *   setStatusFilter: (status: string) => void,
 *   status: 'loading' | 'success' | 'error',
 *   error: string | null,
 *   hasNext: boolean,
 *   isLoadingMore: boolean,
 *   loadMore: () => Promise<void>,
 * }}
 */
export function useArtRuns(initialFilter = 'RECRUITING') {
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [sessions, setSessions] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const loadSeqRef = useRef(0); // 마지막 로드만 반영 (탭 전환 race 방지)

  const load = useCallback(async (filter) => {
    const seq = loadSeqRef.current + 1;
    loadSeqRef.current = seq;
    setStatus('loading');
    try {
      const data = await getArtRuns({ status: filter });
      if (seq !== loadSeqRef.current) {
        return;
      }
      setSessions(data?.sessions ?? []);
      setHasNext(Boolean(data?.hasNext));
      setNextCursor(data?.nextCursor ?? null);
      setError(null);
      setStatus('success');
    } catch {
      if (seq !== loadSeqRef.current) {
        return;
      }
      setError('협동 러닝 목록을 불러오지 못했어요.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load(statusFilter);
  }, [load, statusFilter]);

  const loadMore = useCallback(async () => {
    if (!hasNext || loadingMoreRef.current) {
      return;
    }
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    const seq = loadSeqRef.current;

    try {
      const data = await getArtRuns({ status: statusFilter, cursor: nextCursor });
      if (seq !== loadSeqRef.current) {
        return;
      }
      setSessions((prev) => [...prev, ...(data?.sessions ?? [])]);
      setHasNext(Boolean(data?.hasNext));
      setNextCursor(data?.nextCursor ?? null);
    } catch {
      // 추가 로드 실패는 무시 (다시 시도 가능)
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasNext, statusFilter, nextCursor]);

  return {
    sessions,
    statusFilter,
    setStatusFilter,
    status,
    error,
    hasNext,
    isLoadingMore,
    loadMore,
  };
}
