import { useCallback, useEffect, useRef, useState } from 'react';

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
  // 요청이 겹치면 가장 나중에 보낸 요청의 결과만 화면 상태에 반영한다
  const latestRequestIdRef = useRef(0);

  // 호출한 쪽이 "자기가 요청한" 위치만 쓸 수 있도록 결과를 Promise 로도 돌려준다
  const requestLocation = useCallback(() => new Promise((resolve) => {
    if (!navigator.geolocation) {
      setStatus('unsupported');
      setError('이 브라우저는 위치 기능을 지원하지 않아요.');
      resolve(null);
      return;
    }

    latestRequestIdRef.current += 1;
    const requestId = latestRequestIdRef.current;
    setStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (requestId === latestRequestIdRef.current) {
          setPosition(nextPosition);
          setStatus('granted');
          setError(null);
        }
        // 호출한 쪽에는 자기 요청의 결과를 그대로 돌려준다
        resolve(nextPosition);
      },
      (err) => {
        if (requestId === latestRequestIdRef.current) {
          setStatus(err.code === 1 ? 'denied' : 'error');
          setError(getGeolocationErrorMessage(err));
        }
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
