import styles from './course-condition-form.module.css';

const INTENSITIES = [
  { value: 'EASY', label: '가볍게' },
  { value: 'NORMAL', label: '보통' },
  { value: 'HARD', label: '힘들게' },
];

const MIN_DISTANCE_KM = 1;
const MAX_DISTANCE_KM = 20;

/**
 * 추천 조건(강도, 목표 거리) 입력 폼.
 * @param {string} intensity 선택된 강도 (EASY | NORMAL | HARD)
 * @param {number} distanceKm 목표 거리(km)
 * @param {boolean} [isLoading] 추천 요청 중 여부
 * @param {(intensity: string) => void} onIntensityChange
 * @param {(distanceKm: number) => void} onDistanceChange
 * @param {() => void} onSubmit
 */
export default function CourseConditionForm({
  intensity,
  distanceKm,
  isLoading = false,
  onIntensityChange,
  onDistanceChange,
  onSubmit,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <div
        className={styles.tabs}
        role="group"
        aria-label="강도"
      >
        {INTENSITIES.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={intensity === item.value}
            className={intensity === item.value ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => onIntensityChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <label className={styles.distance}>
        <span className={styles.distanceLabel}>목표 거리</span>
        <input
          className={styles.slider}
          type="range"
          min={MIN_DISTANCE_KM}
          max={MAX_DISTANCE_KM}
          step="1"
          value={distanceKm}
          onChange={(event) => onDistanceChange(Number(event.target.value))}
        />
        <span className={styles.distanceValue}>{distanceKm}km</span>
      </label>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? '코스 찾는 중...' : '코스 추천받기'}
      </button>
    </form>
  );
}
