import defaultAvatar from '../../assets/runner-man.png';

import styles from './running-now-profile.module.css';

export default function RunningNowProfile({
  name,
  handle,
  avatarSrc,
  statusLabel = '현재 러닝 중',
}) {
  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultAvatar;
  };

  return (
    <div className={styles.profile}>
      <div className={styles.avatarWrap}>
        <img
          className={styles.avatar}
          src={avatarSrc || defaultAvatar}
          alt={name || '러너'}
          onError={handleImageError}
        />
      </div>
      <div className={styles.info}>
        <div className={styles.nameRow}>
          {name || handle ? (
            <div className={styles.nameGroup}>
              {name ? <span className={styles.name}>{name}</span> : null}
              {handle ? <span className={styles.handle}>{handle}</span> : null}
            </div>
          ) : (
            <span className={styles.namePlaceholder} aria-hidden="true" />
          )}
          <span className={styles.statusRow}>
            <span
              className={styles.dot}
              aria-hidden="true"
            />
            <span className={styles.statusLabel}>{statusLabel}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
