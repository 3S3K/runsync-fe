import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import KakaoMap from '../../components/map/kakao-map';
import { useArtRun } from '../../hooks/use-art-run';
import { useArtRunResult } from '../../hooks/use-art-run-result';
import { getParticipantColor } from '../../utils/art-run-colors';
import { formatDuration, formatYmdHm } from '../../utils/format-date';
import { DEFAULT_CENTER } from '../../utils/geolocation';
import { smoothPath } from '../../utils/smooth-path';

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

  const isHost = Boolean(me && artRun?.host && me.id === artRun.host.userId);
  const isParticipant = Boolean(me && artRun?.participants?.some((p) => p.userId === me.id));

  // 완료된 러닝을 참가자/호스트가 볼 때만 결과(참가자 경로·기록)를 같이 불러와 상세에서 바로 보여준다
  const showResult = artRun?.status === 'COMPLETED' && (isHost || isParticipant);
  const { result } = useArtRunResult(showResult ? id : null);
  const hasResult = showResult && Boolean(result);

  // 완료: 참가자별 실제 뛴 경로(색상·스무딩)만. 미완료: 도안(점선).
  const mapPaths = useMemo(() => {
    if (hasResult) {
      return (result.participants || [])
        .filter((participant) => participant.paths && participant.paths.length >= 2)
        .map((participant) => ({
          id: `participant-${participant.userId}`,
          points: smoothPath(
            [...participant.paths]
              .sort((a, b) => a.sequence - b.sequence)
              .map((point) => ({ lat: point.latitude, lng: point.longitude })),
          ),
          color: getParticipantColor(participant.userId),
        }));
    }

    return [
      {
        id: 'design',
        points: (artRun?.coordinates || []).map((point) => ({
          lat: point.latitude,
          lng: point.longitude,
        })),
        color: '#243b55',
        dashed: true,
      },
    ];
  }, [artRun, hasResult, result]);

  const center = useMemo(() => {
    const firstTrail = mapPaths.find((path) => path.id !== 'design' && path.points.length > 0);
    if (firstTrail) {
      const mid = firstTrail.points[Math.floor(firstTrail.points.length / 2)];
      return { lat: mid.lat, lng: mid.lng };
    }
    const place = artRun?.meetingPlace;
    return place ? { lat: place.latitude, lng: place.longitude } : DEFAULT_CENTER;
  }, [artRun, mapPaths]);

  // 거리순 정렬 (많이 뛴 사람부터)
  const rankedParticipants = useMemo(
    () => (hasResult
      ? [...(result.participants || [])].sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0))
      : []),
    [hasResult, result],
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

  const isFull = currentCount >= capacity;
  const canJoin = runStatus === 'RECRUITING' && !isHost && !isParticipant && !isFull;
  const showFooter =
    canJoin
    || (isParticipant && !isHost && runStatus === 'RECRUITING')
    || (isHost && runStatus === 'RECRUITING')
    || (runStatus === 'IN_PROGRESS' && (isParticipant || isHost))
    || (!isHost && !isParticipant && runStatus === 'RECRUITING' && isFull);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
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
            paths={mapPaths}
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
          {hasResult ? (
            <ul className={styles.participantList}>
              {rankedParticipants.map((participant) => (
                <li
                  key={participant.userId}
                  className={styles.participant}
                >
                  <span
                    className={styles.colorDot}
                    style={{ background: getParticipantColor(participant.userId) }}
                    aria-hidden="true"
                  />
                  <img
                    className={styles.avatar}
                    src={participant.profileImage || defaultAvatar}
                    alt={participant.nickname}
                    onError={handleImageError}
                  />
                  <span className={styles.participantName}>{participant.nickname}</span>
                  <span className={styles.stats}>
                    <span className={styles.distance}>{(participant.distance ?? 0).toFixed(2)}km</span>
                    <span className={styles.duration}>{formatDuration(participant.durationSeconds)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
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
          )}
        </section>

        {showFooter ? (
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

          {isParticipant && !isHost && runStatus === 'RECRUITING' ? (
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

          {runStatus === 'IN_PROGRESS' && (isParticipant || isHost) ? (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => navigate(`/art-runs/${id}/run`)}
            >
              러닝 참여
            </button>
          ) : null}

          {isHost && runStatus === 'IN_PROGRESS' ? (
            <button
              type="button"
              className={styles.secondaryButton}
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
        ) : null}
      </div>
    </main>
  );
}
