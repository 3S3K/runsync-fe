import { useEffect, useState } from 'react';

import { getFriends } from '../api/friend';
import { currentUser, friends as mockFriends } from '../data/friends';
import { mapApiFriendToListItem } from '../utils/friend-mapper';

/**
 * 친구 목록 패널 데이터.
 * API 성공 시 서버 목록을, 실패 시 mock 데이터를 사용한다.
 */
export function useFriendsList() {
  const [friends, setFriends] = useState(mockFriends);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const list = await getFriends();
        if (cancelled) {
          return;
        }

        if (Array.isArray(list) && list.length > 0) {
          setFriends(list.map(mapApiFriendToListItem));
        }
        setError(null);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    currentUser,
    friends,
    isLoading,
    error,
  };
}
