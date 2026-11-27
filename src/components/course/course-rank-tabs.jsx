import styles from './course-rank-tabs.module.css';

function getSummaryText(course) {
  const distance = `${course.distanceKm.toFixed(1)}km`;
  return course.score != null ? `${course.score}점 · ${distance}` : distance;
}

/**
 * 추천 코스 순위 탭. 누르면 해당 순위의 코스를 보여준다.
 * @param {Array<{ rank: number, score: number | null, distanceKm: number }>} courses
 * @param {number} selectedRank 보고 있는 코스의 순위
 * @param {(rank: number) => void} onSelect
 */
export default function CourseRankTabs({ courses, selectedRank, onSelect }) {
  return (
    <div
      className={styles.tabs}
      role="group"
      aria-label="추천 순위"
    >
      {courses.map((course) => (
        <button
          key={course.rank}
          type="button"
          aria-pressed={course.rank === selectedRank}
          className={course.rank === selectedRank ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => onSelect(course.rank)}
        >
          <span className={styles.rank}>{course.rank}순위</span>
          <span className={styles.summary}>{getSummaryText(course)}</span>
        </button>
      ))}
    </div>
  );
}
