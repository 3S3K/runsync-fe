import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdChevronRight,
  MdDirectionsRun,
  MdEdit,
  MdLock,
  MdLogout,
  MdMoreHoriz,
  MdNotifications,
  MdRoute,
  MdSpeed,
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

const MONTHLY_GOAL_KM = 50;

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

function getActivityPaceLabel(activity) {
  if (activity.paceLabel && activity.paceLabel !== '-') {
    return activity.paceLabel;
  }

  const durationSeconds = activity.durationSeconds
    ?? parseDurationHmsToSeconds(activity.duration);

  return formatPaceFromDistanceAndDuration(activity.distanceKm, durationSeconds);
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
    hasMore,
    isLoadingMore,
    loadMoreActivities,
  } = useMypageData();
  const sentinelRef = useRef(null);
  const loadMoreRef = useRef(loadMoreActivities);

  const dotClass = getDotClassName(user.status);
  const monthlyGoalKm = Number(stats.monthlyGoalKm) || MONTHLY_GOAL_KM;
  const currentDistanceKm = Number(stats.totalDistanceKm) || 0;
  const goalProgress = monthlyGoalKm > 0
    ? Math.min(100, Math.round((currentDistanceKm / monthlyGoalKm) * 100))
    : 0;
  const averagePaceLabel = stats.averagePaceLabel;

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

  // loadMoreActivities 최신 참조를 ref로 유지 (observer 재생성 없이 항상 최신 호출)
  useEffect(() => {
    loadMoreRef.current = loadMoreActivities;
  }, [loadMoreActivities]);

  // 활동 리스트 끝(sentinel)이 보이면 다음 페이지 로드 (무한 스크롤).
  // 의존성은 hasMore 만 — loadMore 참조 변화로 observer 가 재생성/즉시 재발동되는 무한 루프 방지.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        loadMoreRef.current();
      }
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSettingsToggle = () => {
    setIsSettingsOpen((prev) => !prev);
  };

  const handleSettingsAction = (menuId) => {
    setIsSettingsOpen(false);

    if (menuId === 'edit-profile') {
      navigate('/mypage/edit');
    } else if (menuId === 'logout') {
      clearAuthSession();
      navigate('/');
    }
  };

  const renderActivityMeta = (activity) => {
    const paceLabel = getActivityPaceLabel(activity);

    return `${formatDistanceValue(activity.distanceKm)} km · ${activity.duration} · ${paceLabel}/km`;
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
              aria-label="더보기"
              aria-expanded={isSettingsOpen}
              onClick={handleSettingsToggle}
            >
              <MdMoreHoriz className={styles.moreIcon} aria-hidden="true" />
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
          <section className={styles.hero}>
            <div className={styles.heroBackdrop} aria-hidden="true">
              <span className={styles.heroOrbPrimary} />
              <span className={styles.heroOrbSecondary} />
            </div>

            <div className={styles.profileBlock}>
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
                <p className={styles.monthlyRunSummary}>
                  이번 달
                  {' '}
                  <strong>{stats.totalRuns}</strong>
                  회 러닝
                </p>
              </div>
            </div>
          </section>

          <section className={styles.goalCard} aria-label="이번 달 목표">
            <div className={styles.goalHeader}>
              <h3 className={styles.cardTitle}>이번 달 목표</h3>
              <span className={styles.goalProgressText}>
                {goalProgress}
                % 달성
              </span>
            </div>
            <p className={styles.goalDistance}>
              <strong>{formatDistanceValue(currentDistanceKm)}</strong>
              <span className={styles.goalDistanceDivider}>/</span>
              <span>{monthlyGoalKm}</span>
              <span className={styles.goalDistanceUnit}> km</span>
            </p>
            <div
              className={styles.goalProgressTrack}
              role="progressbar"
              aria-valuenow={goalProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`이번 달 목표 ${goalProgress}% 달성`}
            >
              <span
                className={styles.goalProgressFill}
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </section>

          <section
            className={styles.statsCard}
            aria-label="이번 달 러닝"
          >
            <h3 className={styles.cardTitle}>이번 달 러닝</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statIconWrap} aria-hidden="true">
                  <MdRoute className={styles.statIcon} />
                </span>
                <span className={styles.statLabel}>총 거리</span>
                <span className={styles.statValue}>
                  {formatDistanceValue(stats.totalDistanceKm)}
                  <span className={styles.statUnit}> km</span>
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statIconWrap} aria-hidden="true">
                  <MdSpeed className={styles.statIcon} />
                </span>
                <span className={styles.statLabel}>평균 페이스</span>
                <span className={styles.statValue}>{averagePaceLabel}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statIconWrap} aria-hidden="true">
                  <MdDirectionsRun className={styles.statIcon} />
                </span>
                <span className={styles.statLabel}>러닝 횟수</span>
                <span className={styles.statValue}>
                  {stats.totalRuns}
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
              <h3 className={styles.cardTitle}>최근 활동</h3>
            </div>
            {!isUsingMockData && activities.length === 0 ? (
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
            ) : (
              <ul className={styles.activityList}>
                {activities.map((activity) => {
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
                        <span className={styles.activityMeta}>
                          {renderActivityMeta(activity)}
                        </span>
                      </span>
                      <MdChevronRight
                        className={styles.activityChevron}
                        aria-hidden="true"
                      />
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
            )}
            {isLoadingMore ? (
              <p className={styles.activityLoading}>불러오는 중...</p>
            ) : null}
            {hasMore ? (
              <div
                ref={sentinelRef}
                className={styles.activitySentinel}
                aria-hidden="true"
              />
            ) : null}
          </section>
        </div>
        )}
      </div>
    </main>
  );
}
