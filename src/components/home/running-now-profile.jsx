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

  const hasIdentity = Boolean(name || handle);
  const profileClassName = [
    styles.profile,
    muted ? styles.profileMuted : '',
    !hasIdentity ? styles.profileCompact : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={profileClassName}>
      <div className={styles.avatarWrap}>
        <img
          className={styles.avatar}
          src={avatarSrc || defaultAvatar}
          alt={name || '러너'}
          onError={handleImageError}
        />
      </div>
      {hasIdentity ? (
        <div className={styles.identity}>
          {name ? <span className={styles.name}>{name}</span> : null}
          {handle ? <span className={styles.handle}>{handle}</span> : null}
        </div>
      ) : null}
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
