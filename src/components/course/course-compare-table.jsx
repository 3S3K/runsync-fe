import CourseSection from './course-section';
import styles from './course-compare-table.module.css';

const ROWS = [
  { label: '거리', getValue: (course) => `${course.distanceKm.toFixed(2)}km` },
  {
    label: '예상 시간',
    getValue: (course) => (course.estimatedTimeMin != null ? `${course.estimatedTimeMin}분` : '–'),
  },
  { label: '상승 고도', getValue: (course) => `${course.elevationGainM}m` },
  { label: '최대 경사', getValue: (course) => `${course.maxSlopePct.toFixed(1)}%` },
  { label: '심박존', getValue: (course) => course.hrZone ?? '–' },
  { label: '계단', getValue: (course) => (course.stairsCount != null ? `${course.stairsCount}곳` : '–') },
  { label: '추천 점수', getValue: (course) => (course.score != null ? `${course.score}점` : '–') },
];

/**
 * 추천 코스들을 항목별로 나란히 비교하는 표.
 * @param {Array<object>} courses 화면용 코스 목록
 * @param {number} selectedRank 보고 있는 코스의 순위 (해당 열을 강조한다)
 */
export default function CourseCompareTable({ courses, selectedRank }) {
  const getCellClassName = (course) => (course.rank === selectedRank ? styles.selected : undefined);

  return (
    <CourseSection title="한눈에 비교">
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">
              <span className={styles.srOnly}>항목</span>
            </th>
            {courses.map((course) => (
              <th
                key={course.rank}
                scope="col"
                className={getCellClassName(course)}
              >
                {course.rank}순위
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {courses.map((course) => (
                <td
                  key={course.rank}
                  className={getCellClassName(course)}
                >
                  {row.getValue(course)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </CourseSection>
  );
}
