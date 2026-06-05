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
 */
export default function RunningStats({ elapsedSeconds, distance }) {
  return (
    <div className={styles.stats}>
      <div className={styles.item}>
        <span className={styles.label}>시간</span>
        <span className={styles.value}>{formatElapsed(elapsedSeconds)}</span>
      </div>
      <div className={styles.item}>
        <span className={styles.label}>킬로미터</span>
        <span className={styles.value}>{distance.toFixed(2)}</span>
      </div>
    </div>
  );
}
