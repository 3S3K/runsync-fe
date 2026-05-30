import { currentUser, friends } from '../../data/friends';
import { isVisibleOnMap, toMapMarker } from '../../utils/run-status';

import MapMarker from './map-marker';
import styles from './RunningMap.module.css';

const MAP_LABELS = [
  { id: 'union', text: 'UNION', top: '28%', left: '18%' },
  { id: 'street', text: 'STREET', top: '42%', left: '52%' },
  { id: 'friend', text: 'FRIEND', top: '58%', left: '72%' },
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
