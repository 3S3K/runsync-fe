import { useState } from 'react';

import {
  getAvatarBorderClassName,
  getDotClassName,
} from '../../utils/run-status';

import styles from './RunningMap.module.css';

export default function MapMarker({
  status,
  top,
  left,
  initial,
  imageSrc,
  imageAlt = '',
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageSrc) && !imageFailed;

  const dotClassName = `${styles.statusDot} ${getDotClassName(status)}`;
  const avatarClassName = `${styles.avatar} ${getAvatarBorderClassName(status)}`;

  return (
    <div
      className={styles.marker}
      style={{
        top: `${top}%`,
        left: `${left}%`,
      }}
    >
      <span
        className={dotClassName}
        aria-hidden="true"
      />
      <span className={avatarClassName}>
        {showImage ? (
          <img
            className={styles.avatarImage}
            src={imageSrc}
            alt={imageAlt}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className={styles.initial}>{initial}</span>
        )}
      </span>
    </div>
  );
}
