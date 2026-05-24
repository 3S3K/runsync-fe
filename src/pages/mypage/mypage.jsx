import { useNavigate } from 'react-router-dom';

import { currentUser } from '../../data/friends';
import { profileStats, recentActivities } from '../../data/profile';
import { getAvatarBorderClassName, getDotClassName } from '../../utils/run-status';

import styles from './mypage.module.css';

export default function Mypage() {
  const navigate = useNavigate();

  const avatarBorderClass = getAvatarBorderClassName(currentUser.status);
  const dotClass = getDotClassName(currentUser.status);

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
            ←
          </button>
          <h1 className={styles.headerTitle}>내 프로필</h1>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="설정"
            onClick={handleSettings}
          >
            ⚙
          </button>
        </header>

        <div className={styles.hero}>
          <div className={styles.avatarBlock}>
            <div className={`${styles.avatarRing} ${avatarBorderClass}`}>
              <img
                className={styles.avatarImage}
                src={currentUser.avatarSrc}
                alt={currentUser.name}
              />
            </div>
            <span
              className={`${styles.avatarDot} ${dotClass}`}
              aria-hidden="true"
            />
          </div>
          <h2 className={styles.name}>{currentUser.name}</h2>
          <p className={styles.handle}>{currentUser.handle}</p>
          <span className={styles.statusPill}>{currentUser.statusLabel}</span>
        </div>

        <section
          className={styles.statsCard}
          aria-label="러닝 통계"
        >
          <div className={styles.statItem}>
            <span className={styles.statLabel}>총 거리</span>
            <span className={styles.statValue}>
              {profileStats.totalDistanceKm}
              <span className={styles.statUnit}> km</span>
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>총 시간</span>
            <span className={styles.statValue}>{profileStats.totalTime}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>총 횟수</span>
            <span className={styles.statValue}>
              {profileStats.totalRuns}
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
            {recentActivities.map((activity) => (
              <li
                key={activity.id}
                className={styles.activityItem}
              >
                <span
                  className={styles.activityIcon}
                  aria-hidden="true"
                />
                <div className={styles.activityBody}>
                  <span className={styles.activityDate}>{activity.dateLabel}</span>
                  <div className={styles.activityMetrics}>
                    <span className={styles.activityDistance}>
                      {activity.distanceKm}
                      {' '}
                      km
                    </span>
                    <span className={styles.activityDuration}>
                      {activity.duration}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

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
