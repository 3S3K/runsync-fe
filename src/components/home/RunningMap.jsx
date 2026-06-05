import { useMemo } from 'react';

import { useGeolocation } from '../../hooks/use-geolocation';
import { DEFAULT_CENTER } from '../../utils/geolocation';
import KakaoMap from '../map/kakao-map';

import styles from './RunningMap.module.css';

export default function RunningMap() {
  const { position, status, error, requestLocation } = useGeolocation();

  const center = position ?? DEFAULT_CENTER;

  const markers = useMemo(() => {
    if (!position) {
      return [];
    }

    return [{ id: 'me', lat: position.lat, lng: position.lng, title: '내 위치' }];
  }, [position]);

  const showGuide = status === 'denied' || status === 'error' || status === 'unsupported';

  return (
    <div
      className={styles.map}
      aria-label="지도 영역"
    >
      <KakaoMap
        center={center}
        markers={markers}
        className={styles.mapCanvas}
      />
      {showGuide ? (
        <div
          className={styles.guide}
          role="status"
        >
          <p className={styles.guideText}>{error}</p>
          {status !== 'unsupported' ? (
            <button
              type="button"
              className={styles.guideButton}
              onClick={requestLocation}
            >
              다시 시도
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
