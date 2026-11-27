import { useCallback, useMemo, useState } from 'react';
import { MdArrowBackIosNew, MdAutoAwesome } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import CourseCompareTable from '../../components/course/course-compare-table';
import CourseGoalFields from '../../components/course/course-goal-fields';
import CourseLoadingSheet from '../../components/course/course-loading-sheet';
import CourseOverview from '../../components/course/course-overview';
import CourseRankTabs from '../../components/course/course-rank-tabs';
import CourseReason from '../../components/course/course-reason';
import CourseStartPicker from '../../components/course/course-start-picker';
import ElevationChart from '../../components/course/elevation-chart';
import RunnerSummaryCard from '../../components/course/runner-summary-card';
import SlopeLegend from '../../components/course/slope-legend';
import KakaoMap from '../../components/map/kakao-map';
import { useCourseRecommend } from '../../hooks/use-course-recommend';
import { useGeolocation } from '../../hooks/use-geolocation';
import { useRunnerSummary } from '../../hooks/use-runner-summary';
import { formatPace, getIntensityLabel } from '../../utils/course-format';
import { getMapLevel } from '../../utils/course-mapper';

import styles from './course-recommend-page.module.css';

/** 서비스 지역(대전 동구)의 기준 위치: 대전대학교 */
const DAEJEON_UNIV = { lat: 36.3321, lng: 127.4562 };
const DEFAULT_DISTANCE_KM = 5;
const START_MAP_LEVEL = 5;
const ATTRIBUTION = '지도 데이터 © OpenStreetMap contributors · 고도 Copernicus DEM';

function getStartLabel(startMode, hasGeoPosition) {
  if (startMode === 'map') {
    return '선택한 위치 출발';
  }
  return hasGeoPosition ? '현재 위치 출발' : '대전대학교 출발';
}

function getRecordText(summary) {
  if (!summary || summary.recordCount === 0) {
    return null;
  }
  const pace = `평균 ${formatPace(summary.averagePaceSecPerKm)}/km`;
  const heartRate = summary.averageHeartRate ? ` · ${summary.averageHeartRate}bpm` : '';
  return `최근 ${summary.recordCount}회 · ${pace}${heartRate}`;
}

export default function CourseRecommendPage() {
  const navigate = useNavigate();
  const { position: geoPosition, status: geoStatus } = useGeolocation();
  const { summary, status: summaryStatus } = useRunnerSummary();
  const { courses, status, error, recommend } = useCourseRecommend();

  // condition(조건 입력) → progress(추천 생성 중) → result(추천 결과)
  const [step, setStep] = useState('condition');
  const [startMode, setStartMode] = useState('current');
  const [pickedStart, setPickedStart] = useState(null);
  const [intensity, setIntensity] = useState('NORMAL');
  const [distanceKm, setDistanceKm] = useState(DEFAULT_DISTANCE_KM);
  // 결과 화면의 문구가 요청 뒤 바뀐 입력값을 따라가지 않도록, 요청 당시의 조건을 따로 둔다
  const [requested, setRequested] = useState(null);
  const [selectedRank, setSelectedRank] = useState(1);
  const [activeProfileIndex, setActiveProfileIndex] = useState(null);

  const currentStart = geoPosition ?? DAEJEON_UNIV;
  const start = startMode === 'map' ? pickedStart ?? currentStart : currentStart;
  // 추천에 실패하면 조건 입력 화면으로 돌아가 안내 문구를 보여준다
  const view = step === 'progress' && status === 'error' ? 'condition' : step;
  const selectedCourse = courses.find((course) => course.rank === selectedRank) ?? courses[0] ?? null;
  const mapStart = requested?.start ?? start;
  const cursorPosition = view === 'result' && activeProfileIndex != null
    ? selectedCourse?.profile[activeProfileIndex]?.position ?? null
    : null;

  const dotMarkers = useMemo(() => {
    const markers = [{ id: 'start', lat: mapStart.lat, lng: mapStart.lng }];
    if (cursorPosition) {
      markers.push({ id: 'cursor', lat: cursorPosition.lat, lng: cursorPosition.lng });
    }
    return markers;
  }, [mapStart.lat, mapStart.lng, cursorPosition]);

  const handleSubmit = () => {
    setRequested({
      start,
      distanceKm,
      intensityLabel: getIntensityLabel(intensity),
      conditionText: `${distanceKm}km · ${getIntensityLabel(intensity)} · ${getStartLabel(startMode, Boolean(geoPosition))}`,
    });
    setSelectedRank(1);
    setActiveProfileIndex(null);
    setStep('progress');
    recommend({
      startLat: start.lat,
      startLng: start.lng,
      targetDistanceKm: distanceKm,
      intensity,
    });
  };

  const handleSelectRank = (rank) => {
    setSelectedRank(rank);
    setActiveProfileIndex(null);
  };

  const handleProgressComplete = useCallback(() => setStep('result'), []);
  const handleBackToCondition = () => setStep('condition');

  if (view === 'condition') {
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
              <MdArrowBackIosNew
                size={16}
                aria-hidden="true"
              />
            </button>
            <h1 className={styles.title}>AI 코스 추천</h1>
          </header>

          <div className={styles.content}>
            <RunnerSummaryCard
              summary={summary}
              status={summaryStatus}
            />
            <CourseStartPicker
              mode={startMode}
              start={start}
              geoStatus={geoStatus}
              hasGeoPosition={Boolean(geoPosition)}
              onModeChange={setStartMode}
              onPick={setPickedStart}
              onPickDefault={() => setPickedStart(DAEJEON_UNIV)}
            />
            <CourseGoalFields
              distanceKm={distanceKm}
              intensity={intensity}
              averageDistanceKm={summary?.averageDistanceKm ?? null}
              onDistanceChange={setDistanceKm}
              onIntensityChange={setIntensity}
            />
            {status === 'error' ? (
              <p
                className={styles.error}
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <p className={styles.attribution}>{ATTRIBUTION}</p>
          </div>

          <div className={styles.bottomBar}>
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmit}
            >
              <MdAutoAwesome
                size={18}
                aria-hidden="true"
              />
              코스 추천받기
            </button>
          </div>
        </div>
      </main>
    );
  }

  const isResult = view === 'result' && selectedCourse != null;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.mapStage}>
          <KakaoMap
            center={isResult ? selectedCourse.center ?? mapStart : mapStart}
            level={isResult ? getMapLevel(selectedCourse.distanceKm) : START_MAP_LEVEL}
            paths={isResult ? selectedCourse.paths : []}
            dotMarkers={dotMarkers}
            className={styles.map}
          />
          <button
            type="button"
            className={`${styles.backButton} ${styles.mapBackButton}`}
            onClick={handleBackToCondition}
            aria-label={isResult ? '조건 입력으로 돌아가기' : '추천 취소'}
          >
            <MdArrowBackIosNew
              size={16}
              aria-hidden="true"
            />
          </button>
          {isResult && selectedCourse.hasSlopeSegments ? (
            <div className={styles.legend}>
              <SlopeLegend />
            </div>
          ) : null}
        </div>

        <div className={styles.sheet}>
          <span
            className={styles.handle}
            aria-hidden="true"
          />
          {isResult ? (
            <>
              <header className={styles.resultHeader}>
                <div>
                  <h1 className={styles.resultTitle}>추천 코스 {courses.length}개</h1>
                  <p className={styles.resultCondition}>{requested.conditionText}</p>
                </div>
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={handleBackToCondition}
                >
                  조건 변경
                </button>
              </header>

              <div className={styles.stickyTabs}>
                <CourseRankTabs
                  courses={courses}
                  selectedRank={selectedCourse.rank}
                  onSelect={handleSelectRank}
                />
              </div>

              <CourseOverview
                course={selectedCourse}
                intensityLabel={requested.intensityLabel}
                paceText={summary?.averagePaceSecPerKm != null ? formatPace(summary.averagePaceSecPerKm) : null}
              />
              <ElevationChart
                profile={selectedCourse.profile}
                activeIndex={activeProfileIndex}
                onActiveChange={setActiveProfileIndex}
              />
              <CourseReason
                course={selectedCourse}
                targetDistanceKm={requested.distanceKm}
              />
              {courses.length > 1 ? (
                <CourseCompareTable
                  courses={courses}
                  selectedRank={selectedCourse.rank}
                />
              ) : null}
              <p className={styles.attribution}>{ATTRIBUTION}</p>
            </>
          ) : (
            <CourseLoadingSheet
              conditionText={requested.conditionText}
              recordText={getRecordText(summary)}
              isReady={status === 'success'}
              onComplete={handleProgressComplete}
            />
          )}
        </div>
      </div>
    </main>
  );
}
