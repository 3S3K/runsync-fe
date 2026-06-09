import { useEffect, useMemo, useState } from 'react';

import { getParticipantColor } from '../utils/art-run-colors';
import { useStomp } from './use-stomp';

const PUBLISH_DESTINATION = '/app/location';

// 같은 좌표가 연속으로 들어오면 trail 에 추가하지 않는다 (GPS 노이즈/정지 상태).
function appendPoint(trail = [], point) {
  const last = trail[trail.length - 1];
  if (last && last.lat === point.lat && last.lng === point.lng) {
    return trail;
  }
  return [...trail, point];
}

/**
 * 협동 러닝(ArtRun) 실시간 레이어.
 * /topic/artrun/{sessionId} 구독으로 참가자 위치를 누적(trail)하고,
 * /app/location 으로 내 위치를 발행한다.
 * @param {{
 *   active: boolean,
 *   sessionId: number | string | null,
 *   myUserId: number | null,
 *   participants: Array<{ userId: number, nickname: string, profileImage: string }>,
 *   position: { lat: number, lng: number } | null,
 * }} params
 * @returns {{
 *   paths: Array<{ id: string, points: Array<{ lat: number, lng: number }>, color: string }>,
 *   markers: Array<{ id: string|number, lat: number, lng: number, title: string, status: string, profileImage: string }>,
 *   connected: boolean,
 *   closed: boolean,
 *   error: string | null,
 * }}
 */
export function useArtRunRealtime({
  active,
  sessionId,
  myUserId,
  participants,
  position,
}) {
  const { connected, error, subscribe, publish } = useStomp(active);
  const [subscribed, setSubscribed] = useState(false);
  const [trails, setTrails] = useState({}); // 다른 참가자: { [userId]: [{lat,lng}, ...] }
  const [myTrail, setMyTrail] = useState([]); // 내 경로 (로컬 watch 누적)
  const [closed, setClosed] = useState(false);
  const [serverError, setServerError] = useState(null);

  // active 가 꺼지면 누적 상태 초기화
  useEffect(() => {
    if (!active) {
      setSubscribed(false);
      setTrails({});
      setMyTrail([]);
      setClosed(false);
      setServerError(null);
    }
  }, [active]);

  // 세션 토픽 + 에러 큐 구독 (구독 성공 시 subscribed=true → 발행 자격 확보)
  useEffect(() => {
    if (!connected || sessionId == null) {
      return undefined;
    }

    const topicSub = subscribe(`/topic/artrun/${sessionId}`, (payload) => {
      const { type, data } = payload || {};

      if (type === 'ARTRUN_LOCATION_UPDATE') {
        // 내 좌표 echo 는 무시 (내 경로는 로컬 watch 로 그린다)
        if (data?.userId === myUserId) {
          return;
        }
        if (
          typeof data?.latitude === 'number' &&
          typeof data?.longitude === 'number'
        ) {
          const point = { lat: data.latitude, lng: data.longitude };
          setTrails((prev) => ({
            ...prev,
            [data.userId]: appendPoint(prev[data.userId], point),
          }));
        }
      } else if (type === 'ARTRUN_SESSION_CLOSED') {
        setClosed(true);
      } else if (type === 'ARTRUN_PARTICIPANT_LEFT') {
        const leftId = data;
        setTrails((prev) => {
          const next = { ...prev };
          delete next[leftId];
          return next;
        });
      }
    });

    const errorSub = subscribe('/user/queue/errors', (payload) => {
      setServerError(
        typeof payload?.data === 'string' ? payload.data : '서버 오류가 발생했어요.',
      );
    });

    setSubscribed(Boolean(topicSub));

    return () => {
      setSubscribed(false);
      try {
        topicSub?.unsubscribe();
      } catch {
        // 이미 끊긴 연결이면 무시
      }
      try {
        errorSub?.unsubscribe();
      } catch {
        // 이미 끊긴 연결이면 무시
      }
    };
  }, [connected, sessionId, myUserId, subscribe]);

  // 내 위치를 myTrail 에 누적 (좌표 원시값 의존 → 같은 위치 재추가 방지)
  const lat = position?.lat;
  const lng = position?.lng;
  useEffect(() => {
    if (lat == null || lng == null) {
      return;
    }
    setMyTrail((prev) => appendPoint(prev, { lat, lng }));
  }, [lat, lng]);

  // 구독 완료 + 위치 있을 때 내 위치 발행 (구독=발행 자격이므로 subscribed 게이트)
  useEffect(() => {
    if (!subscribed || sessionId == null || lat == null || lng == null) {
      return;
    }
    publish(PUBLISH_DESTINATION, {
      type: 'LOCATION_UPDATE',
      data: {
        artRunSessionId: Number(sessionId),
        latitude: lat,
        longitude: lng,
      },
    });
  }, [subscribed, sessionId, lat, lng, publish]);

  // userId → 닉네임/프로필 매핑 (payload 엔 닉네임이 없어 상세 participants 로 매칭)
  const participantMap = useMemo(() => {
    const map = {};
    (participants || []).forEach((p) => {
      map[p.userId] = p;
    });
    return map;
  }, [participants]);

  // 참가자 trail + 내 trail → KakaoMap paths
  const paths = useMemo(() => {
    const result = Object.entries(trails)
      .filter(([, points]) => points.length >= 2)
      .map(([userId, points]) => ({
        id: `trail-${userId}`,
        points,
        color: getParticipantColor(userId),
      }));

    if (myTrail.length >= 2 && myUserId != null) {
      result.push({
        id: 'trail-me',
        points: myTrail,
        color: getParticipantColor(myUserId),
      });
    }

    return result;
  }, [trails, myTrail, myUserId]);

  // 각 참가자 현재 위치(trail 마지막 점) + 내 위치 → 아바타 마커
  const markers = useMemo(() => {
    const result = Object.entries(trails)
      .filter(([, points]) => points.length > 0)
      .map(([userId, points]) => {
        const last = points[points.length - 1];
        const info = participantMap[userId] || {};
        return {
          id: Number(userId),
          lat: last.lat,
          lng: last.lng,
          title: info.nickname || '참가자',
          status: 'RUNNING',
          profileImage: info.profileImage,
        };
      });

    if (lat != null && lng != null) {
      const me = participantMap[myUserId] || {};
      result.push({
        id: 'me',
        lat,
        lng,
        title: me.nickname || '나',
        status: 'RUNNING',
        profileImage: me.profileImage,
      });
    }

    return result;
  }, [trails, participantMap, myUserId, lat, lng]);

  return { paths, markers, connected, closed, error: serverError ?? error };
}
