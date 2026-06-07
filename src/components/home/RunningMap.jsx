import { useMemo } from 'react';

import { useGeolocation } from '../../hooks/use-geolocation';
import { DEFAULT_CENTER } from '../../utils/geolocation';
import KakaoMap from '../map/kakao-map';

import styles from './RunningMap.module.css';

/**
 * 홈/러닝 지도. position 을 받으면 그 위치를 따라가고(러닝 중),
 * 없으면 자체 현재 위치 조회 + 권한 안내를 사용한다(idle).
 * @param {{ lat: number, lng: number } | null} [position] 외부에서 주입하는 추적 위치
 * @param {boolean} [isTracking] 러닝 추적 중 여부 (true면 권한 안내 숨김)
 * @param {Array<{ id: number, lat: number, lng: number, title?: string }>} [friendMarkers] 친구 실시간 위치 마커
 */
export default function RunningMap({
  position: trackingPosition = null,
  isTracking = false,
  friendMarkers = [],
}) {
  const { position: geoPosition, status, error, requestLocation } = useGeolocation();

  const position = trackingPosition ?? geoPosition;
  const center = position ?? DEFAULT_CENTER;

  const markers = useMemo(() => {
    const list = [...friendMarkers];
    if (position) {
      list.unshift({ id: 'me', lat: position.lat, lng: position.lng, title: '내 위치' });
    }

    return list;
  }, [position, friendMarkers]);

  const showGuide =
    !isTracking &&
    (status === 'denied' || status === 'error' || status === 'unsupported');

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
