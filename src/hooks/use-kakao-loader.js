import { useEffect, useState } from 'react';

const SCRIPT_ID = 'kakao-map-sdk';
const SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js';

/**
 * 카카오맵 JavaScript SDK 를 1회만 로드한다.
 * autoload=false 이므로 kakao.maps.load() 콜백으로 Map 생성자까지 준비된 뒤 ready.
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

    const onReady = () => setStatus('ready');

    // Map 생성자까지 사용 가능하면 바로 ready
    if (window.kakao?.maps?.Map) {
      onReady();
      return undefined;
    }

    const handleError = () => setStatus('error');
    // 스크립트 로드 후 maps 모듈을 load() 로 보장한 뒤 ready
    const handleLoad = () => window.kakao.maps.load(onReady);

    let script = document.getElementById(SCRIPT_ID);

    if (script) {
      // 스크립트는 이미 있으나 maps 모듈이 아직이면 load() 직접 호출
      if (window.kakao?.maps) {
        window.kakao.maps.load(onReady);
      } else {
        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);
      }
    } else {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `${SDK_URL}?appkey=${appKey}&autoload=false`;
      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);
      document.head.appendChild(script);
    }

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, []);

  return status;
}
