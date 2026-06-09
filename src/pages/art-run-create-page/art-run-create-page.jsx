import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createArtRun } from '../../api/art-run';
import KakaoMap from '../../components/map/kakao-map';
import { useGeolocation } from '../../hooks/use-geolocation';
import { DEFAULT_CENTER } from '../../utils/geolocation';

import styles from './art-run-create-page.module.css';

export default function ArtRunCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [capacity, setCapacity] = useState(2);
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingPlaceName, setMeetingPlaceName] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const { position, requestLocation } = useGeolocation();

  // 현재 위치를 얻으면 지도 중심 이동 (진입 시 + "내 위치" 버튼)
  useEffect(() => {
    if (position) {
      setMapCenter(position);
    }
  }, [position]);

  const addWaypoint = (point) => setWaypoints((prev) => [...prev, point]);
  const undoWaypoint = () => setWaypoints((prev) => prev.slice(0, -1));
  const clearWaypoints = () => setWaypoints([]);

  const routePaths = useMemo(
    () => [{ id: 'route', points: waypoints, color: '#ff5a1f', dashed: false }],
    [waypoints],
  );
  const dotMarkers = useMemo(
    () => waypoints.map((point, index) => ({ id: index, lat: point.lat, lng: point.lng })),
    [waypoints],
  );
  const center = mapCenter;

  const canSubmit = Boolean(
    title.trim() &&
      Number.parseInt(capacity, 10) >= 2 &&
      meetingTime &&
      meetingPlaceName.trim() &&
      waypoints.length >= 2 &&
      !isSubmitting,
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      // datetime-local 값은 사용자 로컬 시각. 백엔드가 LocalDateTime 으로 받으므로
      // UTC 변환(toISOString) 없이 'YYYY-MM-DDTHH:mm:ss' 로 그대로 전송한다.
      const meetingTimeLocal =
        meetingTime.length === 16 ? `${meetingTime}:00` : meetingTime;

      const payload = {
        title: title.trim(),
        capacity: Number.parseInt(capacity, 10),
        meetingTime: meetingTimeLocal,
        meetingPlace: {
          name: meetingPlaceName.trim(),
          latitude: waypoints[0].lat,
          longitude: waypoints[0].lng,
        },
        coordinates: waypoints.map((point) => ({
          latitude: point.lat,
          longitude: point.lng,
        })),
      };
      const result = await createArtRun(payload);
      navigate(`/art-runs/${result.sessionId}`);
    } catch {
      window.alert('생성에 실패했어요. 입력값을 확인해 주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate('/art-runs')}
            aria-label="뒤로 가기"
          >
            ←
          </button>
          <h1 className={styles.title}>협동 러닝 만들기</h1>
        </header>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <label className={styles.field}>
            <span className={styles.label}>제목</span>
            <input
              className={styles.input}
              value={title}
              placeholder="예: 한강 하트 그리기"
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>정원 (2명 이상)</span>
            <input
              className={styles.input}
              type="number"
              min="2"
              step="1"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>모임 시간</span>
            <input
              className={styles.input}
              type="datetime-local"
              value={meetingTime}
              onChange={(event) => setMeetingTime(event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>모임 장소 이름</span>
            <input
              className={styles.input}
              value={meetingPlaceName}
              placeholder="예: 여의도 한강공원"
              onChange={(event) => setMeetingPlaceName(event.target.value)}
            />
          </label>

          <div className={styles.mapSection}>
            <div className={styles.mapHeader}>
              <span className={styles.label}>도안 그리기 (지도를 탭해 점 추가, 최소 2점)</span>
              <span className={styles.count}>{waypoints.length}점</span>
            </div>
            <div className={styles.mapWrap}>
              <KakaoMap
                center={center}
                paths={routePaths}
                dotMarkers={dotMarkers}
                onMapClick={addWaypoint}
                className={styles.map}
              />
              <button
                type="button"
                className={styles.locateButton}
                onClick={requestLocation}
              >
                내 위치
              </button>
            </div>
            <div className={styles.mapActions}>
              <button
                type="button"
                className={styles.mapActionButton}
                onClick={undoWaypoint}
                disabled={waypoints.length === 0}
              >
                마지막 점 취소
              </button>
              <button
                type="button"
                className={styles.mapActionButton}
                onClick={clearWaypoints}
                disabled={waypoints.length === 0}
              >
                전체 초기화
              </button>
            </div>
            <p className={styles.hint}>모임 장소 좌표는 도안의 첫 점으로 설정돼요.</p>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!canSubmit}
          >
            {isSubmitting ? '만드는 중...' : '만들기'}
          </button>
        </form>
      </div>
    </main>
  );
}
