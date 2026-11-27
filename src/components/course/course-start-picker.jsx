import { MdMyLocation } from 'react-icons/md';

import KakaoMap from '../map/kakao-map';
import LocateButton from '../map/locate-button';

import CourseSection from './course-section';
import styles from './course-start-picker.module.css';

const START_MODES = [
  { value: 'current', label: '현재 위치' },
  { value: 'map', label: '지도에서 선택' },
];
const PICKER_MAP_LEVEL = 4;

function getCurrentLocationText(geoStatus, hasGeoPosition) {
  if (hasGeoPosition) {
    return '지금 있는 곳에서 출발해요.';
  }
  if (geoStatus === 'idle' || geoStatus === 'loading') {
    return '위치를 확인하는 중이에요.';
  }
  return '위치를 가져오지 못해 대전대학교에서 출발해요.';
}

/**
 * 출발지 선택 카드. 현재 위치로 출발하거나 지도를 눌러 출발 위치를 고른다.
 * @param {'current' | 'map'} mode 출발지 선택 방식
 * @param {{ lat: number, lng: number }} start 현재 정해진 출발 위치
 * @param {string} geoStatus 위치 조회 상태 (use-geolocation 의 status)
 * @param {boolean} [hasGeoPosition] 현재 위치를 받아왔는지
 * @param {number} [recenterKey] 값이 바뀌면 지도를 출발 위치로 다시 옮긴다
 * @param {() => void} onLocate 내 위치 버튼 또는 위치 다시 확인을 눌렀을 때
 * @param {(mode: string) => void} onModeChange
 * @param {(position: { lat: number, lng: number }) => void} onPick 지도에서 위치를 골랐을 때
 * @param {() => void} onPickDefault 기준 위치(대전대)로 출발을 눌렀을 때
 */
export default function CourseStartPicker({
  mode,
  start,
  geoStatus,
  hasGeoPosition = false,
  recenterKey = 0,
  onLocate,
  onModeChange,
  onPick,
  onPickDefault,
}) {
  return (
    <CourseSection title="출발지">
      <div
        className={styles.segment}
        role="group"
        aria-label="출발지 선택 방식"
      >
        {START_MODES.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={mode === item.value}
            className={mode === item.value ? `${styles.segmentItem} ${styles.segmentItemActive}` : styles.segmentItem}
            onClick={() => onModeChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === 'current' ? (
        <div className={styles.current}>
          <span className={styles.currentIcon}>
            <MdMyLocation
              size={20}
              aria-hidden="true"
            />
          </span>
          <div className={styles.currentBody}>
            <p className={styles.currentTitle}>현재 위치</p>
            <p className={styles.currentText}>{getCurrentLocationText(geoStatus, hasGeoPosition)}</p>
          </div>
          {!hasGeoPosition && geoStatus !== 'idle' && geoStatus !== 'loading' && geoStatus !== 'unsupported' ? (
            <button
              type="button"
              className={styles.textButton}
              onClick={onLocate}
            >
              다시 확인
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className={styles.mapBox}>
            <KakaoMap
              center={start}
              recenterKey={recenterKey}
              level={PICKER_MAP_LEVEL}
              dotMarkers={[{ id: 'start', lat: start.lat, lng: start.lng }]}
              onMapClick={onPick}
              className={styles.map}
            />
            <LocateButton
              onClick={onLocate}
              className={styles.locate}
            />
          </div>
          <div className={styles.mapRow}>
            <p className={styles.hint}>지도를 눌러 출발 위치를 정하세요.</p>
            <button
              type="button"
              className={styles.textButton}
              onClick={onPickDefault}
            >
              대전대에서 출발
            </button>
          </div>
        </>
      )}

      <p className={styles.area}>현재는 대전 동구에서만 추천할 수 있어요.</p>
    </CourseSection>
  );
}
