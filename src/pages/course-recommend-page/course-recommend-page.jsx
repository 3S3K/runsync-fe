import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CourseCard from '../../components/course/course-card';
import CourseConditionForm from '../../components/course/course-condition-form';
import KakaoMap from '../../components/map/kakao-map';
import { useCourseRecommend } from '../../hooks/use-course-recommend';
import { useGeolocation } from '../../hooks/use-geolocation';
import { getMapLevel } from '../../utils/course-mapper';

import styles from './course-recommend-page.module.css';

/** 서비스 지역(대전 동구)의 기준 위치: 대전대학교 */
const DAEJEON_UNIV = { lat: 36.3321, lng: 127.4562 };
const DEFAULT_DISTANCE_KM = 5;
const START_MAP_LEVEL = 5;

export default function CourseRecommendPage() {
  const navigate = useNavigate();
  const { position: geoPosition } = useGeolocation();
  const { courses, status, error, recommend } = useCourseRecommend();

  const [pickedStart, setPickedStart] = useState(null);
  const [intensity, setIntensity] = useState('NORMAL');
  const [distanceKm, setDistanceKm] = useState(DEFAULT_DISTANCE_KM);
  const [selectedRank, setSelectedRank] = useState(1);

  // 지도에서 직접 고른 위치 > 현재 위치 > 대전대 순으로 출발 위치를 정한다
  const start = pickedStart ?? geoPosition ?? DAEJEON_UNIV;
  const selectedCourse = courses.find((course) => course.rank === selectedRank) ?? courses[0] ?? null;

  const paths = useMemo(
    () => (selectedCourse
      ? [{ id: `course-${selectedCourse.rank}`, points: selectedCourse.points, color: selectedCourse.color }]
      : []),
    [selectedCourse],
  );
  const startMarkers = useMemo(
    () => [{ id: 'start', lat: start.lat, lng: start.lng }],
    [start.lat, start.lng],
  );

  const handleSubmit = () => {
    setSelectedRank(1);
    recommend({
      startLat: start.lat,
      startLng: start.lng,
      targetDistanceKm: distanceKm,
      intensity,
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
          >
            ←
          </button>
          <h1 className={styles.title}>AI 코스 추천</h1>
        </header>

        <section
          className={styles.mapCard}
          aria-label="코스 지도"
        >
          <KakaoMap
            center={selectedCourse?.center ?? start}
            level={selectedCourse ? getMapLevel(selectedCourse.distanceKm) : START_MAP_LEVEL}
            paths={paths}
            dotMarkers={startMarkers}
            onMapClick={setPickedStart}
            className={styles.map}
          />
        </section>

        <div className={styles.startRow}>
          <p className={styles.hint}>지도를 눌러 출발 위치를 바꿀 수 있어요.</p>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => setPickedStart(DAEJEON_UNIV)}
          >
            대전대에서 출발
          </button>
        </div>

        <CourseConditionForm
          intensity={intensity}
          distanceKm={distanceKm}
          isLoading={status === 'loading'}
          onIntensityChange={setIntensity}
          onDistanceChange={setDistanceKm}
          onSubmit={handleSubmit}
        />

        {status === 'error' ? <p className={styles.stateMessage}>{error}</p> : null}

        {status === 'success' ? (
          <ul className={styles.list}>
            {courses.map((course) => (
              <CourseCard
                key={course.rank}
                course={course}
                isSelected={course.rank === selectedCourse?.rank}
                onClick={() => setSelectedRank(course.rank)}
              />
            ))}
          </ul>
        ) : null}

        <p className={styles.attribution}>지도 데이터 © OpenStreetMap contributors · 고도 Copernicus DEM</p>
      </div>
    </main>
  );
}
