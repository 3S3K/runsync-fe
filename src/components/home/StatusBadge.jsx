import styles from './StatusBadge.module.css';

export default function StatusBadge({
  temperature = '18°',
  location = 'Seoul',
}) {
  return (
    <div
      className={styles.badge}
      aria-label={`날씨 ${temperature} ${location}`}
    >
      <span className={styles.text}>
        {temperature}
        {' '}
        {location}
      </span>
    </div>
  );
}
