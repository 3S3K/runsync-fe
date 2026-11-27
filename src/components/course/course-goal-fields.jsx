import { INTENSITY_OPTIONS } from '../../utils/course-format';

import CourseSection from './course-section';
import styles from './course-goal-fields.module.css';

const DISTANCE_PRESETS_KM = [3, 5, 8, 10];
const MIN_DISTANCE_KM = 1;
const MAX_DISTANCE_KM = 20;

function getChipClassName(isActive) {
  return isActive ? `${styles.chip} ${styles.chipActive}` : styles.chip;
}

/**
 * 목표 거리와 난이도 선택 카드.
 * @param {number} distanceKm 목표 거리(km)
 * @param {string} intensity 선택된 강도 (EASY | NORMAL | HARD)
 * @param {number | null} [averageDistanceKm] 최근 러닝의 회당 평균 거리
 * @param {(distanceKm: number) => void} onDistanceChange
 * @param {(intensity: string) => void} onIntensityChange
 */
export default function CourseGoalFields({
  distanceKm,
  intensity,
  averageDistanceKm = null,
  onDistanceChange,
  onIntensityChange,
}) {
  const selectedIntensity = INTENSITY_OPTIONS.find((option) => option.value === intensity);

  return (
    <>
      <CourseSection
        title="목표 거리"
        aside={averageDistanceKm != null ? (
          <span className={styles.aside}>평소 평균 {averageDistanceKm.toFixed(1)}km</span>
        ) : null}
      >
        <div
          className={styles.chips}
          role="group"
          aria-label="목표 거리"
        >
          {DISTANCE_PRESETS_KM.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-pressed={distanceKm === preset}
              className={getChipClassName(distanceKm === preset)}
              onClick={() => onDistanceChange(preset)}
            >
              {preset}
              <span className={styles.chipUnit}>km</span>
            </button>
          ))}
        </div>
        <label className={styles.sliderRow}>
          <span className={styles.sliderLabel}>직접 조절</span>
          <input
            className={styles.slider}
            type="range"
            min={MIN_DISTANCE_KM}
            max={MAX_DISTANCE_KM}
            step="1"
            value={distanceKm}
            onChange={(event) => onDistanceChange(Number(event.target.value))}
          />
          <span className={styles.sliderValue}>{distanceKm}km</span>
        </label>
      </CourseSection>

      <CourseSection title="난이도">
        <div
          className={styles.chips}
          role="group"
          aria-label="난이도"
        >
          {INTENSITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={intensity === option.value}
              className={getChipClassName(intensity === option.value)}
              onClick={() => onIntensityChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className={styles.description}>{selectedIntensity?.description}</p>
      </CourseSection>
    </>
  );
}
