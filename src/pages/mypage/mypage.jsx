import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdDirectionsRun,
  MdEdit,
  MdLock,
  MdLogout,
  MdNotifications,
  MdSettings,
} from 'react-icons/md';

import { useMypageData } from '../../hooks/use-mypage-data';
import { DEFAULT_PROFILE_AVATAR_SRC } from '../../utils/mypage-data';
import {
  formatPaceFromDistanceAndDuration,
  parseDurationHmsToSeconds,
} from '../../utils/record-formatters';
import { getDotClassName } from '../../utils/run-status';
import { clearAuthSession } from '../../utils/tokens';

import styles from './mypage.module.css';

const MAX_VISIBLE_ACTIVITIES = 4;

const SETTINGS_MENU_ITEMS = [
  { id: 'edit-profile', label: '프로필 편집', icon: MdEdit },
  { id: 'notifications', label: '알림 설정', icon: MdNotifications },
  { id: 'privacy', label: '공개 범위', icon: MdLock },
  { id: 'logout', label: '로그아웃', icon: MdLogout },
];

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

function formatDistanceValue(value) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return '0';
  }

  return Number.isInteger(numericValue)
    ? String(numericValue)
    : numericValue.toFixed(2);
}

function getAveragePaceLabel(activities, fallbackLabel) {
  const totalDistance = activities.reduce(
    (sum, activity) => sum + Number(activity.distanceKm ?? 0),
    0,
  );
  const totalSeconds = activities.reduce((sum, activity) => {
    const durationSeconds = activity.durationSeconds
      ?? parseDurationHmsToSeconds(activity.duration);
    return sum + durationSeconds;
  }, 0);

  if (totalDistance > 0 && totalSeconds > 0) {
    const paceLabel = formatPaceFromDistanceAndDuration(totalDistance, totalSeconds);
    if (paceLabel !== '-') {
      return paceLabel;
    }
  }

  return fallbackLabel || '-';
}

function getAveragePaceDisplay(stats, activities) {
  if (stats.averagePaceLabel && stats.averagePaceLabel !== '-') {
    return stats.averagePaceLabel;
  }

  return getAveragePaceLabel(activities, stats.averagePaceLabel);
}

export default function Mypage() {
  const navigate = useNavigate();
  const settingsRef = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    user,
    stats,
    activities,
    isLoading,
    isUsingMockData,
  } = useMypageData();

  const dotClass = getDotClassName(user.status);
  const visibleActivities = activities.slice(0, MAX_VISIBLE_ACTIVITIES);
  const averagePaceLabel = getAveragePaceDisplay(stats, activities);
  const latestRecordId = activities.find((activity) => activity.recordId)?.recordId;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!settingsRef.current?.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSettingsToggle = () => {
    setIsSettingsOpen((prev) => !prev);
  };

  const handleSettingsAction = (menuId) => {
    setIsSettingsOpen(false);

    if (menuId === 'logout') {
      clearAuthSession();
      navigate('/');
    }
  };

  const handleSeeMoreClick = () => {
    if (latestRecordId) {
      navigate(`/running-record/${latestRecordId}`);
    }
  };

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
          <div className={styles.settingsWrap} ref={settingsRef}>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="설정"
              aria-expanded={isSettingsOpen}
              onClick={handleSettingsToggle}
            >
              <MdSettings className={styles.settingsIcon} aria-hidden="true" />
            </button>
            {isSettingsOpen ? (
              <div className={styles.settingsMenu} role="menu">
                {SETTINGS_MENU_ITEMS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={styles.settingsMenuItem}
                    role="menuitem"
                    onClick={() => handleSettingsAction(id)}
                  >
                    <Icon className={styles.settingsMenuIcon} aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        {isLoading ? (
          <div
            className={styles.loadingState}
            aria-live="polite"
          >
            프로필 정보를 불러오는 중...
          </div>
        ) : (
        <div className={styles.content}>
          <section className={styles.profileSection}>
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

            <div className={styles.profileMeta}>
              <h2 className={styles.name}>{user.name}</h2>
              <p className={styles.handle}>{user.handle}</p>
              <span className={styles.statusPill}>{user.statusLabel}</span>
            </div>
          </section>

          <section
            className={styles.statsCard}
            aria-label="러닝 통계"
          >
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>월간 거리</span>
                <span className={styles.statValue}>
                  <span className={styles.statNumber}>
                    {formatDistanceValue(stats.totalDistanceKm)}
                  </span>
                  <span className={styles.statUnit}> km</span>
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>평균 페이스</span>
                <span className={styles.statValue}>
                  <span className={styles.statNumber}>{averagePaceLabel}</span>
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>월간 횟수</span>
                <span className={styles.statValue}>
                  <span className={styles.statNumber}>{stats.totalRuns}</span>
                  <span className={styles.statUnit}> 회</span>
                </span>
              </div>
            </div>
          </section>

          <section
            className={styles.activitySection}
            aria-label="최근 활동"
          >
            <div className={styles.activityHeader}>
              <h3 className={styles.sectionTitle}>최근 활동</h3>
              <button
                type="button"
                className={styles.seeMore}
                onClick={handleSeeMoreClick}
                disabled={!latestRecordId}
                aria-label="최근 러닝 기록 더보기"
              >
                더보기 &gt;
              </button>
            </div>

            {!isUsingMockData && activities.length === 0 ? (
              <div className={styles.activityCard}>
                <div className={styles.activityEmpty}>
                  <span className={styles.activityEmptyIcon} aria-hidden="true">
                    <MdDirectionsRun className={styles.activityEmptyIconSvg} />
                  </span>
                  <p className={styles.activityEmptyTitle}>
                    아직 러닝 기록이 없어요.
                  </p>
                  <p className={styles.activityEmptyText}>
                    첫 러닝을 시작해보세요!
                  </p>
                </div>
              </div>
            ) : (
              <div className={styles.activityCard}>
                <ul className={styles.activityList}>
                  {visibleActivities.map((activity) => {
                    const content = (
                      <>
                        <span className={styles.activityIcon}>
                          <MdDirectionsRun
                            className={styles.runningIcon}
                            aria-hidden="true"
                          />
                        </span>
                        <span className={styles.activityBody}>
                          <span className={styles.activityDate}>{activity.dateLabel}</span>
                          <span className={styles.activityDistance}>
                            <span className={styles.activityDistanceValue}>
                              {formatDistanceValue(activity.distanceKm)}
                            </span>
                            <span className={styles.activityDistanceUnit}> km</span>
                          </span>
                        </span>
                        <span className={styles.activityDuration}>
                          {activity.duration}
                        </span>
                      </>
                    );

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
                            {content}
                          </button>
                        </li>
                      );
                    }

                    return (
                      <li
                        key={activity.id}
                        className={`${styles.activityItem} ${styles.activityItemStatic}`}
                      >
                        {content}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        </div>
        )}
      </div>
    </main>
  );
}
