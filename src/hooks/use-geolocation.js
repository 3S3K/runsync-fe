import { useCallback, useEffect, useState } from 'react';

import { GEO_OPTIONS, getGeolocationErrorMessage } from '../utils/geolocation';

/**
 * 브라우저 현재 위치를 조회하는 커스텀 훅.
 * @returns {{
 *   position: { lat: number, lng: number } | null,
 *   error: string | null,
 *   status: 'idle' | 'loading' | 'granted' | 'denied' | 'error' | 'unsupported',
 *   requestLocation: () => Promise<{ lat: number, lng: number } | null>,  요청한 위치를 돌려준다 (실패하면 null)
 * }}
 */
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');

  // 호출한 쪽이 "자기가 요청한" 위치만 쓸 수 있도록 결과를 Promise 로도 돌려준다
  const requestLocation = useCallback(() => new Promise((resolve) => {
    if (!navigator.geolocation) {
      setStatus('unsupported');
      setError('이 브라우저는 위치 기능을 지원하지 않아요.');
      resolve(null);
      return;
    }

    setStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(nextPosition);
        setStatus('granted');
        setError(null);
        resolve(nextPosition);
      },
      (err) => {
        setStatus(err.code === 1 ? 'denied' : 'error');
        setError(getGeolocationErrorMessage(err));
        resolve(null);
      },
      GEO_OPTIONS,
    );
  }), []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { position, error, status, requestLocation };
}
