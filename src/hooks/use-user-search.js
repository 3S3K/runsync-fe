import { useCallback, useRef, useState } from 'react';

import { sendFriendRequest } from '../api/friend';
import { searchUsers } from '../api/user';

/**
 * 닉네임 사용자 검색 + 친구 요청 전송을 관리하는 훅.
 * @returns {{
 *   users: Array<object>,
 *   status: 'idle' | 'loading' | 'success' | 'error',
 *   error: string | null,
 *   hasNext: boolean,
 *   requestingIds: Array<number>,
 *   search: (nickname: string) => Promise<void>,
 *   loadMore: () => Promise<void>,
 *   requestFriend: (userId: number) => Promise<void>,
 * }}
 */
export function useUserSearch() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [requestingIds, setRequestingIds] = useState([]);

  const searchSeqRef = useRef(0); // 마지막 검색만 반영 (race 방지)
  const inFlightRef = useRef(new Set()); // 요청 중복 전송 방지

  const search = useCallback(async (nickname) => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      return;
    }

    const seq = searchSeqRef.current + 1;
    searchSeqRef.current = seq;
    setKeyword(trimmed);
    setStatus('loading');

    try {
      const data = await searchUsers(trimmed);
      if (seq !== searchSeqRef.current) {
        return;
      }
      setUsers(data?.users ?? []);
      setHasNext(Boolean(data?.hasNext));
      setNextCursor(data?.nextCursor ?? null);
      setError(null);
      setStatus('success');
    } catch {
      if (seq !== searchSeqRef.current) {
        return;
      }
      setError('검색에 실패했어요.');
      setStatus('error');
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasNext || !keyword) {
      return;
    }

    const seq = searchSeqRef.current;
    try {
      const data = await searchUsers(keyword, { cursor: nextCursor });
      if (seq !== searchSeqRef.current) {
        return;
      }
      setUsers((prev) => [...prev, ...(data?.users ?? [])]);
      setHasNext(Boolean(data?.hasNext));
      setNextCursor(data?.nextCursor ?? null);
    } catch {
      // 추가 로드 실패는 무시 (다시 시도 가능)
    }
  }, [hasNext, keyword, nextCursor]);

  const requestFriend = useCallback(async (userId) => {
    if (inFlightRef.current.has(userId)) {
      return;
    }
    inFlightRef.current.add(userId);
    setRequestingIds((prev) => [...prev, userId]);

    try {
      await sendFriendRequest(userId);
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, relation: 'REQUEST_SENT' } : user)),
      );
    } finally {
      inFlightRef.current.delete(userId);
      setRequestingIds((prev) => prev.filter((id) => id !== userId));
    }
  }, []);

  return { users, status, error, hasNext, requestingIds, search, loadMore, requestFriend };
}
