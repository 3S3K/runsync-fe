import { useState } from 'react';

import { getAvatarBorderClassName, getDotClassName } from '../../utils/run-status';

import styles from './friend-list-item.module.css';

export default function FriendListItem({
  name,
  handle,
  status,
  statusLabel,
  avatarSrc,
  isCurrentUser = false,
}) {
  const [imageError, setImageError] = useState(false);
  const avatarWrapClassName = `${styles.avatarWrap} ${getAvatarBorderClassName(status)}`;
  const dotClassName = `${styles.dot} ${getDotClassName(status)}`;
  const itemClassName = isCurrentUser
    ? `${styles.item} ${styles.itemMe}`
    : styles.item;
  const showImage = avatarSrc && !imageError;

  return (
    <li className={itemClassName}>
      <div className={avatarWrapClassName}>
        {showImage ? (
          <img
            className={styles.avatar}
            src={avatarSrc}
            alt={name}
            onError={() => setImageError(true)}
          />
        ) : (
          <span className={styles.avatarFallback}>
            {name?.charAt(0) || '?'}
          </span>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.nameRow}>
          <span className={styles.nameGroup}>
            <span className={styles.name}>{name}</span>
            {isCurrentUser ? (
              <span className={styles.meBadge}>나</span>
            ) : null}
          </span>
          <span className={styles.statusRow}>
            <span
              className={dotClassName}
              aria-hidden="true"
            />
            <span className={styles.statusLabel}>{statusLabel}</span>
          </span>
        </div>
        <span className={styles.handle}>{handle}</span>
      </div>
    </li>
  );
}
