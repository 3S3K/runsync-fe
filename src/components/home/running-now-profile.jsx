import defaultAvatar from '../../assets/runner-man.png';

import styles from './running-now-profile.module.css';

export default function RunningNowProfile({
  name,
  handle,
  avatarSrc,
  statusLabel = '현재 러닝 중',
  muted = false,
}) {
  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultAvatar;
  };

  const displayName = name || handle || '러너';
  const profileClassName = [
    styles.profile,
    muted ? styles.profileMuted : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={profileClassName}>
      <div className={styles.avatarWrap}>
        <img
          className={styles.avatar}
          src={avatarSrc || defaultAvatar}
          alt={displayName}
          onError={handleImageError}
        />
      </div>
      <div className={styles.identity}>
        <span className={styles.name}>{displayName}</span>
        {name && handle ? (
          <span className={styles.handle}>{handle}</span>
        ) : null}
      </div>
      <span className={styles.statusRow}>
        <span
          className={styles.dot}
          aria-hidden="true"
        />
        <span className={styles.statusLabel}>{statusLabel}</span>
      </span>
    </div>
  );
}
