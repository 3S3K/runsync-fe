import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdDirectionsRun } from 'react-icons/md';

import { useMypageData } from '../../hooks/use-mypage-data';
import { DEFAULT_PROFILE_AVATAR_SRC } from '../../utils/mypage-data';
import { getDotClassName } from '../../utils/run-status';

import styles from './mypage.module.css';

function ProfileAvatar({ src, alt }) {
  const [avatarSrc, setAvatarSrc] = useState(src || DEFAULT_PROFILE_AVATAR_SRC);

  useEffect(() => {
    setAvatarSrc(src || DEFAULT_PROFILE_AVATAR_SRC);
  }, [src]);

  const handleImageError = () => {
    if (avatarSrc === DEFAULT_PROFILE_AVATAR_SRC) {
      return;
    }

    setAvatarSrc(DEFAULT_PROFILE_AVATAR_SRC);
  };

  return (
    <img
      className={styles.avatarImage}
      src={avatarSrc}
      alt={alt}
      onError={handleImageError}
    />
  );
}

export default function Mypage() {
  const navigate = useNavigate();
  const {
    user,
    stats,
    activities,
    isLoading,
  } = useMypageData();

  const dotClass = getDotClassName(user.status);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSettings = () => {};

  const handleEditProfile = () => {};

  const handleViewMoreActivities = () => {};

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="뒤로 가기"
            onClick={handleBack}
          >
            <span className={styles.backIcon} aria-hidden="true" />
          </button>
          <h1 className={styles.headerTitle}>내 프로필</h1>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="설정"
            onClick={handleSettings}
          >
            <span className={styles.settingsIcon} aria-hidden="true" />
          </button>
        </header>

        {isLoading ? (
          <div
            className={styles.loadingState}
            aria-live="polite"
          >
            프로필 정보를 불러오는 중...
          </div>
        ) : null}

        <div className={styles.content}>
          <section className={styles.hero}>
            <div className={styles.avatarBlock}>
              <div className={styles.avatarRing}>
                <ProfileAvatar
                  src={user.avatarSrc}
                  alt={user.name}
                />
              </div>
              <span
                className={`${styles.avatarDot} ${dotClass}`}
                aria-hidden="true"
              />
            </div>
            <h2 className={styles.name}>{user.name}</h2>
            <p className={styles.handle}>{user.handle}</p>
            <span className={styles.statusPill}>{user.statusLabel}</span>
          </section>

          <section
            className={styles.statsCard}
            aria-label="러닝 통계"
          >
            <div className={styles.statItem}>
              <span className={styles.statLabel}>총 거리</span>
              <span className={styles.statValue}>
                {stats.totalDistanceKm}
                <span className={styles.statUnit}> km</span>
              </span>
            </div>
            <div className={`${styles.statItem} ${styles.statItemTime}`}>
              <span className={styles.statLabel}>총 시간</span>
              <span className={`${styles.statValue} ${styles.statValueTime}`}>
                {stats.totalTime}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>총 횟수</span>
              <span className={styles.statValue}>
                {stats.totalRuns}
                <span className={styles.statUnit}> 회</span>
              </span>
            </div>
          </section>

          <section
            className={styles.activitySection}
            aria-label="최근 활동"
          >
            <div className={styles.activityHeader}>
              <h3 className={styles.activityTitle}>최근 활동</h3>
              <button
                type="button"
                className={styles.viewMoreButton}
                onClick={handleViewMoreActivities}
              >
                더보기 &gt;
              </button>
            </div>
            <ul className={styles.activityList}>
              {activities.map((activity) => {
                if (activity.recordId) {
                  return (
                    <li
                      key={activity.id}
                      className={styles.activityItem}
                    >
                      <button
                        type="button"
                        className={styles.activityButton}
                        onClick={() => navigate(`/running-record/${activity.recordId}`)}
                      >
                        <span className={styles.activityIcon}>
                          <MdDirectionsRun
                            className={styles.runningIcon}
                            aria-hidden="true"
                          />
                        </span>
                        <span className={styles.activityBody}>
                          <span className={styles.activityDate}>{activity.dateLabel}</span>
                          <span className={styles.activityDistance}>
                            {activity.distanceKm}
                            {' '}
                            km
                          </span>
                        </span>
                        <span className={styles.activityDuration}>
                          {activity.duration}
                        </span>
                      </button>
                    </li>
                  );
                }

                return (
                  <li
                    key={activity.id}
                    className={`${styles.activityItem} ${styles.activityItemStatic}`}
                  >
                    <span className={styles.activityIcon}>
                      <MdDirectionsRun
                        className={styles.runningIcon}
                        aria-hidden="true"
                      />
                    </span>
                    <div className={styles.activityBody}>
                      <span className={styles.activityDate}>{activity.dateLabel}</span>
                      <span className={styles.activityDistance}>
                        {activity.distanceKm}
                        {' '}
                        km
                      </span>
                    </div>
                    <span className={styles.activityDuration}>
                      {activity.duration}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.editButton}
            onClick={handleEditProfile}
          >
            프로필 편집
          </button>
        </footer>
      </div>
    </main>
  );
}
