import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import KakaoMap from '../../components/map/kakao-map';
import { useArtRun } from '../../hooks/use-art-run';
import { formatYmdHm } from '../../utils/format-date';
import { DEFAULT_CENTER } from '../../utils/geolocation';

import defaultAvatar from '../../assets/runner-man.png';
import styles from './art-run-detail-page.module.css';

const STATUS_LABEL = {
  RECRUITING: '모집중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
};

export default function ArtRunDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    artRun,
    me,
    status,
    error,
    isProcessing,
    join,
    leave,
    changeStatus,
    remove,
  } = useArtRun(id);

  const center = useMemo(() => {
    const place = artRun?.meetingPlace;
    return place ? { lat: place.latitude, lng: place.longitude } : DEFAULT_CENTER;
  }, [artRun]);

  const routePaths = useMemo(
    () => [
      {
        id: 'route',
        points: (artRun?.coordinates || []).map((point) => ({
          lat: point.latitude,
          lng: point.longitude,
        })),
        color: '#243b55',
        dashed: true,
      },
    ],
    [artRun],
  );

  const runAction = async (action, failMessage) => {
    try {
      await action();
    } catch {
      window.alert(failMessage);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('이 협동 러닝을 삭제할까요?')) {
      return;
    }
    try {
      await remove();
      navigate('/art-runs');
    } catch {
      window.alert('삭제에 실패했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultAvatar;
  };

  if (status === 'loading') {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <p className={styles.stateMessage}>불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (status === 'error' || !artRun) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <p className={styles.stateMessage}>{error || '정보를 불러오지 못했어요.'}</p>
        </div>
      </main>
    );
  }

  const {
    title,
    status: runStatus,
    host,
    capacity,
    currentCount,
    meetingTime,
    meetingPlace,
    participants,
  } = artRun;

  const isHost = Boolean(me && host && me.id === host.userId);
  const isParticipant = Boolean(me && participants?.some((p) => p.userId === me.id));
  const isFull = currentCount >= capacity;
  const canJoin = runStatus === 'RECRUITING' && !isHost && !isParticipant && !isFull;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate('/art-runs')}
            aria-label="뒤로 가기"
          >
            ←
          </button>
          <h1 className={styles.title}>{title}</h1>
          <span className={styles.status}>{STATUS_LABEL[runStatus] || runStatus}</span>
        </header>

        <div className={styles.mapWrap}>
          <KakaoMap
            center={center}
            paths={routePaths}
            className={styles.map}
          />
        </div>

        <section className={styles.info}>
          <div className={styles.infoRow}>
            <span className={styles.label}>호스트</span>
            <span>{host?.nickname}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>모임 시간</span>
            <span>{formatYmdHm(meetingTime)}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>모임 장소</span>
            <span>{meetingPlace?.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>인원</span>
            <span>{currentCount}/{capacity}명</span>
          </div>
        </section>

        <section className={styles.participantsSection}>
          <h2 className={styles.sectionTitle}>참가자 {currentCount}명</h2>
          <ul className={styles.participantList}>
            {participants?.map((participant) => (
              <li
                key={participant.userId}
                className={styles.participant}
              >
                <img
                  className={styles.avatar}
                  src={participant.profileImage || defaultAvatar}
                  alt={participant.nickname}
                  onError={handleImageError}
                />
                <span className={styles.participantName}>{participant.nickname}</span>
              </li>
            ))}
          </ul>
        </section>

        <footer className={styles.footer}>
          {canJoin ? (
            <button
              type="button"
              className={styles.primaryButton}
              disabled={isProcessing}
              onClick={() => runAction(join, '참가에 실패했어요.')}
            >
              참가하기
            </button>
          ) : null}

          {isParticipant && !isHost ? (
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={isProcessing}
              onClick={() => runAction(leave, '참가 취소에 실패했어요.')}
            >
              참가 취소
            </button>
          ) : null}

          {isHost && runStatus === 'RECRUITING' ? (
            <button
              type="button"
              className={styles.primaryButton}
              disabled={isProcessing}
              onClick={() => runAction(() => changeStatus('IN_PROGRESS'), '시작에 실패했어요.')}
            >
              시작하기
            </button>
          ) : null}

          {isHost && runStatus === 'RECRUITING' ? (
            <button
              type="button"
              className={styles.dangerButton}
              disabled={isProcessing}
              onClick={handleDelete}
            >
              삭제
            </button>
          ) : null}

          {isHost && runStatus === 'IN_PROGRESS' ? (
            <button
              type="button"
              className={styles.primaryButton}
              disabled={isProcessing}
              onClick={() => runAction(() => changeStatus('COMPLETED'), '종료에 실패했어요.')}
            >
              종료하기
            </button>
          ) : null}

          {!isHost && !isParticipant && runStatus === 'RECRUITING' && isFull ? (
            <p className={styles.fullNotice}>정원이 가득 찼어요.</p>
          ) : null}
        </footer>
      </div>
    </main>
  );
}
