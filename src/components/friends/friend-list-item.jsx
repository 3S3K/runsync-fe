import { getAvatarBorderClassName, getDotClassName } from '../../utils/run-status';

import defaultAvatar from '../../assets/runner-man.png';
import styles from './friend-list-item.module.css';

export default function FriendListItem({
  name,
  handle,
  status,
  statusLabel,
  avatarSrc,
  isCurrentUser = false,
  onDelete,
}) {
  const avatarWrapClassName = `${styles.avatarWrap} ${getAvatarBorderClassName(status)}`;
  const dotClassName = `${styles.dot} ${getDotClassName(status)}`;
  const itemClassName = isCurrentUser
    ? `${styles.item} ${styles.itemMe}`
    : styles.item;

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultAvatar;
  };

  return (
    <li className={itemClassName}>
      <div className={avatarWrapClassName}>
        <img
          className={styles.avatar}
          src={avatarSrc || defaultAvatar}
          alt={name}
          onError={handleImageError}
        />
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
        {handle ? <span className={styles.handle}>{handle}</span> : null}
      </div>
      {!isCurrentUser && onDelete ? (
        <button
          type="button"
          className={styles.deleteButton}
          onClick={onDelete}
          aria-label={`${name} 친구 삭제`}
        >
          삭제
        </button>
      ) : null}
    </li>
  );
}
