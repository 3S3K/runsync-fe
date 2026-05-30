import runnerMan from '../../assets/runner-man.png';
import runnerWomanLong from '../../assets/runner-woman-long.png';
import runnerWomanShort from '../../assets/runner-woman-short.png';

import styles from './RunningMap.module.css';

const MAP_LABELS = [
  { id: 'union', text: 'UNION', top: '28%', left: '18%' },
  { id: 'street', text: 'STREET', top: '42%', left: '52%' },
  { id: 'friend', text: 'FRIEND', top: '58%', left: '72%' },
];

const FRIEND_MARKERS = [
  {
    id: 'marker-1',
    accent: 'green',
    top: 40,
    left: 26,
    imageSrc: runnerWomanLong,
    imageAlt: '러너 프로필 장발',
  },
  {
    id: 'marker-2',
    accent: 'blue',
    top: 58,
    left: 52,
    imageSrc: runnerMan,
    imageAlt: '러너 프로필 남성',
  },
  {
    id: 'marker-3',
    accent: 'purple',
    top: 34,
    left: 74,
    imageSrc: runnerWomanShort,
    imageAlt: '러너 프로필 단발',
  },
];

export default function RunningMap() {
  return (
    <div
      className={styles.map}
      aria-label="지도 영역"
      role="img"
    >
      <div
        className={styles.grid}
        aria-hidden="true"
      />
      {MAP_LABELS.map((label) => (
        <span
          key={label.id}
          className={styles.label}
          style={{ top: label.top, left: label.left }}
          aria-hidden="true"
        >
          {label.text}
        </span>
      ))}
      {FRIEND_MARKERS.map((marker) => (
        <div
          key={marker.id}
          className={`${styles.marker} ${styles[marker.accent]}`}
          style={{
            top: `${marker.top}%`,
            left: `${marker.left}%`,
          }}
        >
          <span
            className={styles.statusDot}
            aria-hidden="true"
          />
          <span className={styles.avatar}>
            <img
              className={styles.avatarImage}
              src={marker.imageSrc}
              alt={marker.imageAlt}
            />
          </span>
        </div>
      ))}
    </div>
  );
}
