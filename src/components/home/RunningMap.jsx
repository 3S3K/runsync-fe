import { useEffect, useMemo, useState } from 'react';

import { useGeolocation } from '../../hooks/use-geolocation';
import { useMyProfileImage } from '../../hooks/use-my-profile-image';
import { DEFAULT_CENTER } from '../../utils/geolocation';
import KakaoMap from '../map/kakao-map';
import LocateButton from '../map/locate-button';

import styles from './RunningMap.module.css';

/**
 * 홈/러닝 지도. position 을 받으면 그 위치를 따라가고(러닝 중),
 * 없으면 자체 현재 위치 조회 + 권한 안내를 사용한다(idle).
 * @param {{ lat: number, lng: number } | null} [position] 외부에서 주입하는 추적 위치
 * @param {boolean} [isTracking] 러닝 추적 중 여부 (true면 권한 안내 숨김)
 * @param {Array<{ id: number, lat: number, lng: number, title?: string }>} [friendMarkers] 친구 실시간 위치 마커
 * @param {boolean} [hasTopLeftControl] 화면 왼쪽 위에 다른 버튼(뒤로 가기 등)이 있으면 내 위치 버튼을 그 아래에 둔다
 */
export default function RunningMap({
  position: trackingPosition = null,
  isTracking = false,
  friendMarkers = [],
  hasTopLeftControl = false,
}) {
  const { position: geoPosition, status, error, requestLocation } = useGeolocation();
  const myProfileImage = useMyProfileImage();
  // 값이 바뀔 때마다 지도를 현재 중심으로 다시 옮긴다 (지도를 끌어 옮긴 뒤 돌아올 때)
  const [recenterKey, setRecenterKey] = useState(0);

  // 위치를 새로 받으면 좌표가 직전과 같아도 그 위치로 돌아간다
  useEffect(() => {
    if (geoPosition) {
      setRecenterKey((key) => key + 1);
    }
  }, [geoPosition]);

  const handleLocate = () => {
    if (trackingPosition) {
      // 러닝 중에는 추적 중인 위치가 이미 최신이다
      setRecenterKey((key) => key + 1);
      return;
    }
    requestLocation();
  };

  const position = trackingPosition ?? geoPosition;
  const center = position ?? DEFAULT_CENTER;

  const lat = position?.lat;
  const lng = position?.lng;
  const markers = useMemo(() => {
    const list = [...friendMarkers];
    if (lat != null && lng != null) {
      list.unshift({ id: 'me', lat, lng, title: '내 위치', profileImage: myProfileImage });
    }

    return list;
  }, [lat, lng, friendMarkers, myProfileImage]);

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
        recenterKey={recenterKey}
        markers={markers}
        className={styles.mapCanvas}
      />
      {status !== 'unsupported' ? (
        <LocateButton
          onClick={handleLocate}
          isLocating={!trackingPosition && status === 'loading'}
          className={hasTopLeftControl ? `${styles.locate} ${styles.locateBelow}` : styles.locate}
        />
      ) : null}
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
