import { useCallback, useEffect, useRef, useState } from 'react';

import {
  finishRunSession,
  saveRunRecordDetail,
  startRunSession,
  updateRunLocation,
} from '../api/runSessionApi';
import { hasStoredAccessToken } from '../utils/access-token';
import {
  buildLocationUpdatePayload,
  buildRunRecordDetailPayload,
  buildRunSessionEndPayload,
  buildRunSessionStartPayload,
  estimateAveragePaceMinPerKm,
  getDefaultRunCoordinates,
} from '../utils/run-session-payloads';
import {
  ACTIVE_RUN_SESSION_RETRY_MESSAGE,
  getActiveRunSessionConflictMessage,
  isActiveRunSessionConflict,
} from '../utils/run-session-errors';
import {
  clearActiveRunSession,
  getActiveRunSessionId,
  getRunSessionStartedAt,
  setActiveRunSession,
} from '../utils/run-session-store';

const MOCK_SESSION_ID = 'mock-session';
const LOCATION_UPDATE_INTERVAL_MS = 15_000;
const MOCK_DISTANCE_KM_PER_SECOND = 0.0028;

function getElapsedSeconds(startedAt) {
  if (!startedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}

function estimateDistanceKm(durationSeconds) {
  return Number((durationSeconds * MOCK_DISTANCE_KM_PER_SECOND).toFixed(2));
}

function readCurrentCoordinates() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(getDefaultRunCoordinates());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve(getDefaultRunCoordinates());
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 30_000,
      },
    );
  });
}

export function useHomeRunSession() {
  const [isRunning, setIsRunning] = useState(Boolean(getActiveRunSessionId()));
  const [isLoading, setIsLoading] = useState(false);

  const sessionIdRef = useRef(getActiveRunSessionId());
  const startedAtRef = useRef(getRunSessionStartedAt() || Date.now());
  const locationIntervalRef = useRef(null);
  const isApiModeRef = useRef(hasStoredAccessToken());

  const clearLocationInterval = useCallback(() => {
    if (locationIntervalRef.current) {
      window.clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  }, []);

  const sendLocationUpdate = useCallback(async () => {
    const sessionId = sessionIdRef.current;
    if (!sessionId || !isApiModeRef.current || sessionId === MOCK_SESSION_ID) {
      return;
    }

    const startedAt = startedAtRef.current;
    const durationSeconds = getElapsedSeconds(startedAt);
    const distanceKm = estimateDistanceKm(durationSeconds);
    const coordinates = await readCurrentCoordinates();

    try {
      await updateRunLocation(
        sessionId,
        buildLocationUpdatePayload({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          distanceKm,
          durationSeconds,
        }),
      );
    } catch (error) {
      console.error('[useHomeRunSession] PATCH /api/run-sessions/{sessionId}/location failed', error);
    }
  }, []);

  const startLocationUpdates = useCallback(() => {
    clearLocationInterval();

    if (!isApiModeRef.current || !sessionIdRef.current) {
      return;
    }

    void sendLocationUpdate();
    locationIntervalRef.current = window.setInterval(() => {
      void sendLocationUpdate();
    }, LOCATION_UPDATE_INTERVAL_MS);
  }, [clearLocationInterval, sendLocationUpdate]);

  const restoreLocalApiSession = useCallback(() => {
    const storedSessionId = getActiveRunSessionId();

    if (!storedSessionId || storedSessionId === MOCK_SESSION_ID) {
      return false;
    }

    const numericSessionId = Number(storedSessionId);

    if (!Number.isFinite(numericSessionId)) {
      return false;
    }

    isApiModeRef.current = true;
    sessionIdRef.current = numericSessionId;
    startedAtRef.current = getRunSessionStartedAt() || Date.now();
    setIsRunning(true);
    startLocationUpdates();
    return true;
  }, [startLocationUpdates]);

  const startMockSession = useCallback(() => {
    isApiModeRef.current = false;
    sessionIdRef.current = MOCK_SESSION_ID;
    startedAtRef.current = Date.now();
    setActiveRunSession(MOCK_SESSION_ID, startedAtRef.current);
    setIsRunning(true);
  }, []);

  const startApiSession = useCallback(async () => {
    isApiModeRef.current = true;
    const startedAt = Date.now();

    try {
      const response = await startRunSession(buildRunSessionStartPayload(startedAt));
      const sessionId = response?.data?.sessionId;

      if (!sessionId) {
        throw new Error('sessionId missing in start run session response');
      }

      sessionIdRef.current = Number(sessionId);
      startedAtRef.current = startedAt;
      setActiveRunSession(sessionId, startedAt);
      setIsRunning(true);
      startLocationUpdates();
    } catch (error) {
      if (isActiveRunSessionConflict(error)) {
        console.warn(getActiveRunSessionConflictMessage(error));

        if (restoreLocalApiSession()) {
          return;
        }

        console.warn(ACTIVE_RUN_SESSION_RETRY_MESSAGE);
        window.alert(ACTIVE_RUN_SESSION_RETRY_MESSAGE);
        return;
      }

      console.error(
        '[useHomeRunSession] POST /api/run-sessions failed',
        error.response?.data || error,
      );
    }
  }, [restoreLocalApiSession, startLocationUpdates]);

  const stopMockSession = useCallback(() => {
    clearLocationInterval();
    sessionIdRef.current = null;
    startedAtRef.current = null;
    clearActiveRunSession();
    setIsRunning(false);
  }, [clearLocationInterval]);

  const stopApiSession = useCallback(async () => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) {
      stopMockSession();
      return;
    }

    clearLocationInterval();

    const durationSeconds = getElapsedSeconds(startedAtRef.current);
    const totalDistance = estimateDistanceKm(durationSeconds);
    const averagePace = estimateAveragePaceMinPerKm(totalDistance, durationSeconds);

    const finishBody = buildRunSessionEndPayload({
      endTime: new Date(),
      totalDistance,
    });
    console.log('finishRunSession body', finishBody);

    try {
      await finishRunSession(sessionId, finishBody);
    } catch (error) {
      console.error('finishRunSession failed', error.response?.data || error);
    }

    const recordBody = buildRunRecordDetailPayload({
      averagePace: averagePace ?? undefined,
      calories: totalDistance > 0 ? Math.round(totalDistance * 60) : undefined,
    });
    console.log('saveRunRecord body', recordBody);

    try {
      await saveRunRecordDetail(sessionId, recordBody);
    } catch (error) {
      console.error('saveRunRecord failed', error.response?.data || error);
    } finally {
      sessionIdRef.current = null;
      startedAtRef.current = null;
      clearActiveRunSession();
      setIsRunning(false);
    }
  }, [clearLocationInterval, stopMockSession]);

  const handleRunButtonClick = useCallback(async () => {
    if (isLoading) return;

    if (isRunning) {
      setIsLoading(true);
      try {
        if (isApiModeRef.current && sessionIdRef.current !== MOCK_SESSION_ID) {
          await stopApiSession();
        } else {
          stopMockSession();
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      if (hasStoredAccessToken()) {
        await startApiSession();
      } else {
        startMockSession();
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    isRunning,
    startApiSession,
    startMockSession,
    stopApiSession,
    stopMockSession,
  ]);

  useEffect(() => {
    const storedSessionId = getActiveRunSessionId();
    const hasToken = hasStoredAccessToken();

    if (storedSessionId && hasToken && storedSessionId !== MOCK_SESSION_ID) {
      restoreLocalApiSession();
    }

    return () => {
      clearLocationInterval();
    };
  }, [clearLocationInterval, restoreLocalApiSession]);

  return {
    isRunning,
    isLoading,
    handleRunButtonClick,
  };
}
