import styles from './running-stats.module.css';

function formatElapsed(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * 러닝 중/종료 후 경과 시간과 누적 거리를 표시하는 컴포넌트.
 * @param {number} elapsedSeconds 경과 시간(초)
 * @param {number} distance 누적 거리(km)
 * @param {string} [location] 현재 위치 텍스트 (선택)
 */
export default function RunningStats({ elapsedSeconds, distance, location }) {
  return (
    <div className={styles.stats}>
      {location ? (
        <div className={styles.row}>
          <span
            className={styles.iconWrap}
            aria-hidden="true"
          >
            <span className={styles.locationIcon} />
          </span>
          <div className={styles.meta}>
            <span className={styles.label}>현재 위치</span>
            <span className={styles.value}>{location}</span>
          </div>
        </div>
      ) : null}
      <div className={styles.row}>
        <span
          className={styles.iconWrap}
          aria-hidden="true"
        >
          <span className={styles.timeIcon} />
        </span>
        <div className={styles.meta}>
          <span className={styles.label}>시간</span>
          <span className={styles.value}>{formatElapsed(elapsedSeconds)}</span>
        </div>
      </div>
      <div className={styles.row}>
        <span
          className={styles.iconWrap}
          aria-hidden="true"
        >
          <span className={styles.distanceIcon} />
        </span>
        <div className={styles.meta}>
          <span className={styles.label}>거리</span>
          <span className={styles.value}>{distance.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
