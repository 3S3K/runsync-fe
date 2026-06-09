import { useEffect, useState } from 'react';

import { GEO_OPTIONS, getGeolocationErrorMessage } from '../utils/geolocation';

/**
 * active 동안 watchPosition 으로 내 위치를 연속 추적하는 훅.
 * active 가 false 가 되거나 언마운트되면 추적을 해제한다.
 * @param {boolean} active true일 때 추적 시작
 * @returns {{ position: { lat: number, lng: number } | null, error: string | null }}
 */
export function useGeoWatch(active) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!active) {
      // 추적이 꺼지면 오래된 위치/에러가 UI 에 남지 않도록 초기화
      setPosition(null);
      setError(null);
      return undefined;
    }

    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 기능을 지원하지 않아요.');
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (geoPosition) => {
        setPosition({
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude,
        });
        setError(null);
      },
      (geoError) => setError(getGeolocationErrorMessage(geoError)),
      GEO_OPTIONS,
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [active]);

  return { position, error };
}
