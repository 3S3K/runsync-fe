import { useCallback, useEffect, useState } from 'react';

import { GEO_OPTIONS, getGeolocationErrorMessage } from '../utils/geolocation';

/**
 * 브라우저 현재 위치를 조회하는 커스텀 훅.
 * @returns {{
 *   position: { lat: number, lng: number } | null,
 *   error: string | null,
 *   status: 'idle' | 'loading' | 'granted' | 'denied' | 'error' | 'unsupported',
 *   requestLocation: () => void,
 * }}
 */
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unsupported');
      setError('이 브라우저는 위치 기능을 지원하지 않아요.');
      return;
    }

    setStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
        setError(null);
      },
      (err) => {
        setStatus(err.code === 1 ? 'denied' : 'error');
        setError(getGeolocationErrorMessage(err));
      },
      GEO_OPTIONS,
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { position, error, status, requestLocation };
}
