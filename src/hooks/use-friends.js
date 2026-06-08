import { useCallback, useEffect, useState } from 'react';

import { deleteFriend, getFriends } from '../api/friend';
import { getMe } from '../api/user';

/**
 * 친구 목록 + 내 정보를 불러오고 삭제를 관리하는 훅.
 * @returns {{
 *   me: object | null,
 *   friends: Array<object>,
 *   status: 'loading' | 'success' | 'error',
 *   error: string | null,
 *   removeFriend: (friendUserId: number) => Promise<void>,
 *   reload: () => void,
 * }}
 */
export function useFriends() {
  const [me, setMe] = useState(null);
  const [friends, setFriends] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');

    const [meResult, friendsResult] = await Promise.allSettled([getMe(), getFriends()]);

    // 내 정보 실패는 허용 ("나" 행만 비움)
    if (meResult.status === 'fulfilled') {
      setMe(meResult.value);
    }

    // 친구 목록은 핵심이라 실패하면 에러 (빈 목록 ≠ 로드 실패)
    if (friendsResult.status === 'fulfilled') {
      setFriends(friendsResult.value);
      setError(null);
      setStatus('success');
    } else {
      setError('친구 목록을 불러오지 못했어요.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeFriend = useCallback(async (friendUserId) => {
    await deleteFriend(friendUserId);
    setFriends((prev) => prev.filter((friend) => friend.friendUserId !== friendUserId));
  }, []);

  return { me, friends, status, error, removeFriend, reload: load };
}
