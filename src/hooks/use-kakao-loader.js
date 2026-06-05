import { useEffect, useState } from 'react';

const SCRIPT_ID = 'kakao-map-sdk';
const SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js';

/**
 * 카카오맵 JavaScript SDK 를 1회만 로드한다.
 * autoload=false 로 받아 kakao.maps.load() 콜백 이후 ready 로 전환.
 * @returns {'loading' | 'ready' | 'error'} 로드 상태
 */
export function useKakaoLoader() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const appKey = process.env.REACT_APP_KAKAO_MAP_JS_KEY;

    if (!appKey) {
      setStatus('error');
      return undefined;
    }

    if (window.kakao && window.kakao.maps) {
      setStatus('ready');
      return undefined;
    }

    const handleLoad = () => {
      window.kakao.maps.load(() => setStatus('ready'));
    };
    const handleError = () => setStatus('error');

    let script = document.getElementById(SCRIPT_ID);

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `${SDK_URL}?appkey=${appKey}&autoload=false`;
      document.head.appendChild(script);
    }

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, []);

  return status;
}
