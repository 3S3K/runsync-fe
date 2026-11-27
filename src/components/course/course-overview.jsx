import {
  MdFavoriteBorder,
  MdSchedule,
  MdStairs,
  MdStraighten,
  MdTerrain,
  MdTrendingUp,
} from 'react-icons/md';

import styles from './course-overview.module.css';

const RING_RADIUS = 22;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function ScoreRing({ score }) {
  return (
    <div className={styles.score}>
      <svg
        className={styles.ring}
        viewBox="0 0 52 52"
        role="img"
        aria-label={`추천 점수 ${score}점`}
      >
        <circle
          className={styles.ringTrack}
          cx="26"
          cy="26"
          r={RING_RADIUS}
        />
        <circle
          className={styles.ringValue}
          cx="26"
          cy="26"
          r={RING_RADIUS}
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - score / 100)}
        />
        <text
          className={styles.ringText}
          x="26"
          y="31"
        >
          {score}
        </text>
      </svg>
      <span className={styles.scoreLabel}>추천<br />점수</span>
    </div>
  );
}

function getStats(course, paceText) {
  const hrDetail = course.hrBpmRange
    ? `${course.hrBpmRange[0]}~${course.hrBpmRange[1]}bpm`
    : `최대 심박의 ${course.predictedHrPct}%`;

  return [
    { icon: MdStraighten, value: course.distanceKm.toFixed(2), unit: 'km', label: '거리' },
    {
      icon: MdSchedule,
      value: course.estimatedTimeMin,
      unit: '분',
      label: '예상 시간',
      detail: course.estimatedTimeMin != null && paceText ? `${paceText}/km 기준` : '기록이 쌓이면 계산해요',
    },
    { icon: MdTerrain, value: course.elevationGainM, unit: 'm', label: '상승 고도' },
    { icon: MdTrendingUp, value: course.maxSlopePct.toFixed(1), unit: '%', label: '최대 경사' },
    { icon: MdFavoriteBorder, value: course.hrZone, unit: '', label: '예상 심박존', detail: hrDetail },
    { icon: MdStairs, value: course.stairsCount, unit: '곳', label: '계단' },
  ];
}

/**
 * 선택한 코스의 이름·점수와 주요 수치 6종.
 * @param {object} course 화면용 코스 (course-mapper 의 mapCourse 결과)
 * @param {string} intensityLabel 요청한 난이도 이름
 * @param {string | null} [paceText] 예상 시간 계산에 쓴 평균 페이스 (예: 6'20")
 */
export default function CourseOverview({ course, intensityLabel, paceText = null }) {
  return (
    <section className={styles.overview}>
      <header className={styles.header}>
        <h3 className={styles.name}>{course.name}</h3>
        <span className={styles.badge}>난이도 {intensityLabel}</span>
        {course.score != null ? <ScoreRing score={course.score} /> : null}
      </header>

      <ul className={styles.stats}>
        {getStats(course, paceText).map((stat) => (
          <li
            key={stat.label}
            className={styles.stat}
          >
            <stat.icon
              className={styles.statIcon}
              size={18}
              aria-hidden="true"
            />
            <span className={styles.statValue}>
              {stat.value ?? '–'}
              {stat.value != null && stat.unit ? <span className={styles.statUnit}>{stat.unit}</span> : null}
            </span>
            <span className={styles.statLabel}>{stat.label}</span>
            {stat.detail ? <span className={styles.statDetail}>{stat.detail}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
