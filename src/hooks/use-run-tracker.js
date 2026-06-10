import { useCallback, useEffect, useRef, useState } from 'react';

import {
  endRunSession,
  saveRunRecord,
  startRunSession,
  updateRunLocation,
} from '../api/run-session';
import { getDistanceKm } from '../utils/distance';
import { GEO_OPTIONS, getGeolocationErrorMessage } from '../utils/geolocation';

const TIMER_INTERVAL_MS = 1000;
const LOCATION_SAVE_INTERVAL_MS = 5000;
const MIN_MOVE_KM = 0.005; // GPS 흔들림(정지 상태 노이즈) 무시용 최소 이동(약 5m)

/**
 * 러닝 한 판의 상태/추적/세션 API를 묶는 훅.
 * @returns {{
 *   status: 'idle' | 'running' | 'finished',
 *   sessionId: number | null,
 *   position: { lat: number, lng: number } | null,
 *   distance: number,        // 누적 거리(km)
 *   elapsedSeconds: number,  // 경과 시간(초)
 *   error: string | null,    // 위치 추적 에러 안내
 *   start: (artRunSessionId?: number) => Promise<void>,
 *   resume: (session: { sessionId: number, startTime: string, distance?: number }) => void,
 *   stop: () => Promise<void>,
 *   saveRecord: (record: object) => Promise<void>,
 * }}
 */
export function useRunTracker() {
  const [status, setStatus] = useState('idle');
  const [sessionId, setSessionId] = useState(null);
  const [position, setPosition] = useState(null);
  const [distance, setDistance] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState(null);

  // 인터벌/콜백이 최신 값을 읽도록 ref로도 보관 (stale closure 방지)
  const watchIdRef = useRef(null);
  const timerIdRef = useRef(null);
  const saveIdRef = useRef(null);
  const lastPositionRef = useRef(null);
  const distanceRef = useRef(0);
  const elapsedRef = useRef(0);
  const sessionIdRef = useRef(null);
  const busyRef = useRef(false); // start/stop 재진입(더블클릭) 방지

  const clearTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    if (saveIdRef.current) {
      clearInterval(saveIdRef.current);
      saveIdRef.current = null;
    }
  }, []);

  const handlePosition = useCallback((geoPosition) => {
    const next = {
      lat: geoPosition.coords.latitude,
      lng: geoPosition.coords.longitude,
    };

    const last = lastPositionRef.current;
    if (last) {
      const delta = getDistanceKm(last, next);
      if (delta >= MIN_MOVE_KM) {
        distanceRef.current += delta;
        setDistance(distanceRef.current);
        lastPositionRef.current = next;
      }
    } else {
      lastPositionRef.current = next;
    }

    setPosition(next);
  }, []);

  // 위치 추적/타이머/주기 저장 시작 (sessionIdRef·거리·경과는 호출 전에 세팅돼 있어야 함).
  // start(새 세션)와 resume(기존 세션 이어받기)가 공유한다.
  const beginTracking = useCallback(() => {
    setError(null);
    setStatus('running');

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        (geoError) => setError(getGeolocationErrorMessage(geoError)),
        GEO_OPTIONS,
      );
    } else {
      setError('이 브라우저는 위치 기능을 지원하지 않아요.');
    }

    timerIdRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsedSeconds(elapsedRef.current);
    }, TIMER_INTERVAL_MS);

    saveIdRef.current = setInterval(() => {
      const lastPosition = lastPositionRef.current;
      if (!sessionIdRef.current || !lastPosition) {
        return;
      }

      updateRunLocation(sessionIdRef.current, {
        lastLatitude: lastPosition.lat,
        lastLongitude: lastPosition.lng,
        currentDistance: distanceRef.current,
        currentDurationTime: elapsedRef.current,
      }).catch(() => {});
    }, LOCATION_SAVE_INTERVAL_MS);
  }, [handlePosition]);

  const start = useCallback(async (artRunSessionId) => {
    if (busyRef.current || sessionIdRef.current) {
      return;
    }
    busyRef.current = true;

    try {
      const session = await startRunSession(new Date().toISOString(), artRunSessionId);
      if (!session?.sessionId) {
        throw new Error('러닝 세션 생성에 실패했어요.');
      }

      sessionIdRef.current = session.sessionId;
      setSessionId(session.sessionId);

      distanceRef.current = 0;
      elapsedRef.current = 0;
      lastPositionRef.current = null;
      setDistance(0);
      setElapsedSeconds(0);

      beginTracking();
    } finally {
      busyRef.current = false;
    }
  }, [beginTracking]);

  // 앱 종료/크래시로 남은 세션을 이어받는다 (GET /api/run-sessions/active 결과를 넘김).
  // 시간은 startTime 부터 복원, 거리는 session.distance(없으면 0)부터 재누적.
  const resume = useCallback((session) => {
    if (busyRef.current || sessionIdRef.current || !session?.sessionId) {
      return;
    }
    busyRef.current = true;

    try {
      sessionIdRef.current = session.sessionId;
      setSessionId(session.sessionId);

      const startedAt = session.startTime ? Date.parse(session.startTime) : NaN;
      const elapsed = Number.isNaN(startedAt)
        ? 0
        : Math.max(0, Math.floor((Date.now() - startedAt) / 1000));

      elapsedRef.current = elapsed;
      distanceRef.current = session.distance ?? 0;
      lastPositionRef.current = null;
      setElapsedSeconds(elapsed);
      setDistance(distanceRef.current);

      beginTracking();
    } finally {
      busyRef.current = false;
    }
  }, [beginTracking]);

  const stop = useCallback(async () => {
    if (busyRef.current || !sessionIdRef.current) {
      return;
    }
    busyRef.current = true;

    try {
      clearTracking();
      await endRunSession(sessionIdRef.current, {
        endTime: new Date().toISOString(),
        totalDistance: distanceRef.current,
      });
      setError(null);
      setStatus('finished');
    } catch (error) {
      setError('러닝 종료에 실패했어요. 다시 시도해 주세요.');
      throw error; // 호출부(try/catch)가 실패를 감지할 수 있도록 다시 던진다
    } finally {
      busyRef.current = false;
    }
  }, [clearTracking]);

  const reset = useCallback(() => {
    clearTracking();
    sessionIdRef.current = null;
    distanceRef.current = 0;
    elapsedRef.current = 0;
    lastPositionRef.current = null;
    setSessionId(null);
    setPosition(null);
    setDistance(0);
    setElapsedSeconds(0);
    setError(null);
    setStatus('idle');
  }, [clearTracking]);

  const saveRecord = useCallback(async (record) => {
    try {
      if (sessionIdRef.current) {
        await saveRunRecord(sessionIdRef.current, record);
      }

      reset();
    } catch (error) {
      setError('기록 저장에 실패했어요. 다시 시도해 주세요.');
      throw error; // 저장 실패 시 호출부가 navigate 하지 않도록 다시 던진다
    }
  }, [reset]);

  // 언마운트 시 추적 정리
  useEffect(() => clearTracking, [clearTracking]);

  return {
    status,
    sessionId,
    position,
    distance,
    elapsedSeconds,
    error,
    start,
    resume,
    stop,
    saveRecord,
  };
}
