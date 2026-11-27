import styles from './course-card.module.css';

/**
 * 추천 코스 한 개를 보여주는 카드. 누르면 지도에 해당 코스가 표시된다.
 * @param {{ rank: number, distanceKm: number, elevationGainM: number, predictedHrPct: number, reason: string, color: string }} course
 * @param {boolean} [isSelected] 지도에 표시 중인 코스 여부
 * @param {() => void} onClick
 */
export default function CourseCard({ course, isSelected = false, onClick }) {
  return (
    <li>
      <button
        type="button"
        className={isSelected ? `${styles.card} ${styles.cardSelected}` : styles.card}
        aria-pressed={isSelected}
        onClick={onClick}
      >
        <div className={styles.summary}>
          <span
            className={styles.rank}
            style={{ backgroundColor: course.color }}
          >
            {course.rank}
          </span>
          <span className={styles.distance}>{course.distanceKm.toFixed(1)}km</span>
          <span className={styles.stat}>오르막 {course.elevationGainM}m</span>
          <span className={styles.stat}>예상 강도 {course.predictedHrPct}%</span>
        </div>
        <p className={styles.reason}>{course.reason}</p>
      </button>
    </li>
  );
}
