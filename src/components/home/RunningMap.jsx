import { currentUser, friends } from '../../data/friends';
import { isVisibleOnMap, toMapMarker } from '../../utils/run-status';

import MapMarker from './map-marker';
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

export default function RunningMap({ compact = false }) {
  const peopleOnMap = compact
    ? [currentUser]
    : [currentUser, ...friends].filter((person) => isVisibleOnMap(person.status));

  const markers = peopleOnMap.map(toMapMarker);
  
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
      {markers.map((marker) => (
        <MapMarker
          key={marker.id}
          status={marker.status}
          top={marker.top}
          left={marker.left}
          initial={marker.initial}
          imageSrc={marker.imageSrc}
          imageAlt={marker.imageAlt}
        />
      ))}
    </div>
  );
}
