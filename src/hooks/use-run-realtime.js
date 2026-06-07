import { useEffect, useMemo, useState } from 'react';

import { getFriends } from '../api/friend';
import { useStomp } from './use-stomp';

const PUBLISH_DESTINATION = '/app/location';

/**
 * 러닝 중 실시간 위치 레이어.
 * 하나의 STOMP 연결로 내 위치를 발행하고 친구들의 위치/상태를 구독한다.
 * @param {{ isRunning: boolean, sessionId: number | null, position: { lat: number, lng: number } | null }} params
 * @returns {{
 *   friendMarkers: Array<{ id: number, lat: number, lng: number, title: string, status: string, profileImage: string }>,
 *   connected: boolean,
 *   error: string | null,
 * }}
 */
export function useRunRealtime({ isRunning, sessionId, position }) {
  const { connected, error, subscribe, publish } = useStomp(isRunning);
  const [friends, setFriends] = useState([]);
  const [locations, setLocations] = useState({});
  const [statuses, setStatuses] = useState({});
  const [serverError, setServerError] = useState(null);

  // 연결 종료 시 누적 상태 초기화
  useEffect(() => {
    if (!isRunning) {
      setFriends([]);
      setLocations({});
      setStatuses({});
      setServerError(null);
    }
  }, [isRunning]);

  // 서버 에러 큐 구독
  useEffect(() => {
    if (!connected) {
      return undefined;
    }

    const sub = subscribe('/user/queue/errors', (payload) => {
      setServerError(
        typeof payload?.data === 'string' ? payload.data : '서버 오류가 발생했어요.',
      );
    });

    return () => {
      try {
        sub?.unsubscribe();
      } catch {
        // 이미 끊긴 연결이면 무시
      }
    };
  }, [connected, subscribe]);

  // 1) 연결되면 친구 목록 조회
  useEffect(() => {
    if (!connected) {
      return undefined;
    }

    let cancelled = false;
    getFriends()
      .then((list) => {
        if (!cancelled) {
          setFriends(list);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [connected]);

  // 2) 친구별 위치/상태 구독
  useEffect(() => {
    if (!connected || friends.length === 0) {
      return undefined;
    }

    const subscriptions = [];
    friends.forEach((friend) => {
      const id = friend.friendUserId;

      const locationSub = subscribe(`/topic/location/${id}`, (payload) => {
        const data = payload?.data;
        if (
          typeof data?.latitude === 'number' &&
          typeof data?.longitude === 'number'
        ) {
          setLocations((prev) => ({
            ...prev,
            [id]: { lat: data.latitude, lng: data.longitude },
          }));
        }
      });

      const statusSub = subscribe(`/topic/status/${id}`, (payload) => {
        const data = payload?.data;
        if (data) {
          setStatuses((prev) => ({ ...prev, [id]: data.status }));
        }
      });

      if (locationSub) {
        subscriptions.push(locationSub);
      }
      if (statusSub) {
        subscriptions.push(statusSub);
      }
    });

    return () => {
      subscriptions.forEach((sub) => {
        try {
          sub.unsubscribe();
        } catch {
          // 이미 끊긴 연결이면 무시
        }
      });
    };
  }, [connected, friends, subscribe]);

  // 3) 내 위치 발행 (좌표 원시값으로 의존 → 불필요 발행 방지)
  const lat = position?.lat;
  const lng = position?.lng;
  useEffect(() => {
    if (!connected || lat == null || lng == null) {
      return;
    }

    publish(PUBLISH_DESTINATION, {
      type: 'LOCATION_UPDATE',
      data: {
        sessionId,
        latitude: lat,
        longitude: lng,
      },
    });
  }, [connected, lat, lng, sessionId, publish]);

  // 4) 위치가 들어온 친구만 마커로
  const friendMarkers = useMemo(
    () =>
      friends
        .filter((friend) => {
          const status = statuses[friend.friendUserId] ?? friend.activityStatus;
          return locations[friend.friendUserId] && status !== 'OFFLINE';
        })
        .map((friend) => ({
          id: friend.friendUserId,
          lat: locations[friend.friendUserId].lat,
          lng: locations[friend.friendUserId].lng,
          title: friend.nickname,
          status: statuses[friend.friendUserId] ?? friend.activityStatus,
          profileImage: friend.profileImage,
        })),
    [friends, locations, statuses],
  );

  return { friendMarkers, connected, error: serverError ?? error };
}
