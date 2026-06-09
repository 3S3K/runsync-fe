import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import RunRecordForm from '../../components/home/run-record-form';
import RunningStats from '../../components/home/running-stats';
import StartButton from '../../components/home/StartButton';
import StopButton from '../../components/home/stop-button';
import KakaoMap from '../../components/map/kakao-map';
import { useArtRun } from '../../hooks/use-art-run';
import { useArtRunRealtime } from '../../hooks/use-art-run-realtime';
import { useRunTracker } from '../../hooks/use-run-tracker';
import { DEFAULT_CENTER } from '../../utils/geolocation';

import styles from './art-run-run-page.module.css';

const DESIGN_COLOR = '#9e9e9e';

export default function ArtRunRunPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { artRun, me, status } = useArtRun(id);
  const [mapCenter, setMapCenter] = useState(null);
  const [recenterKey, setRecenterKey] = useState(0);

  // 개인 러닝(타이머·실제 거리·세션·기록 저장) — 메인 페이지와 동일한 훅 재사용
  const run = useRunTracker();
  const isIdle = run.status === 'idle';
  const isRunning = run.status === 'running';
  const isFinished = run.status === 'finished';

  const myUserId = me?.id ?? null;
  const runStatus = artRun?.status;
  const participants = artRun?.participants;

  const isParticipant = Boolean(
    me && participants?.some((p) => p.userId === me.id),
  );
  const isHost = Boolean(me && artRun?.host && me.id === artRun.host.userId);
  const canRun = runStatus === 'IN_PROGRESS' && (isParticipant || isHost);

  // 진행중이 아니거나 참가자/호스트가 아니면 상세로 돌려보낸다 (me 로딩 후 판정).
  useEffect(() => {
    if (status === 'success' && me && !canRun) {
      navigate(`/art-runs/${id}`, { replace: true });
    }
  }, [status, me, canRun, id, navigate]);

  // 아트 레이어: 개인 러닝이 진행 중일 때만 구독/발행 (내 위치는 run-tracker 가 추적)
  const { paths, markers, closed } = useArtRunRealtime({
    active: isRunning,
    sessionId: id,
    myUserId,
    participants,
    position: run.position,
  });

  // 도안(점선) + 참가자 trail
  const designPath = useMemo(
    () => ({
      id: 'design',
      points: (artRun?.coordinates || []).map((point) => ({
        lat: point.latitude,
        lng: point.longitude,
      })),
      color: DESIGN_COLOR,
      dashed: true,
    }),
    [artRun],
  );
  const mapPaths = useMemo(() => [designPath, ...paths], [designPath, paths]);

  // 지도 중심은 최초 1회만 설정 (내 위치 우선, 없으면 모임 장소).
  useEffect(() => {
    if (mapCenter) {
      return;
    }
    if (run.position) {
      setMapCenter(run.position);
    } else if (artRun?.meetingPlace) {
      setMapCenter({
        lat: artRun.meetingPlace.latitude,
        lng: artRun.meetingPlace.longitude,
      });
    }
  }, [run.position, artRun, mapCenter]);

  const center = mapCenter || DEFAULT_CENTER;

  const handleStart = async () => {
    try {
      await run.start();
    } catch (error) {
      console.error('러닝 시작 실패', error);
    }
  };

  const handleStop = async () => {
    try {
      await run.stop();
    } catch (error) {
      console.error('러닝 종료 실패', error);
    }
  };

  const handleSaveRecord = async (record) => {
    try {
      await run.saveRecord(record);
      navigate(`/art-runs/${id}`);
    } catch (error) {
      console.error('기록 저장 실패', error);
    }
  };

  const handleLocate = () => {
    if (run.position) {
      setMapCenter({ ...run.position });
      setRecenterKey((key) => key + 1);
    }
  };

  if (status === 'loading') {
    return (
      <main className={styles.page}>
        <p className={styles.stateMessage}>불러오는 중...</p>
      </main>
    );
  }

  if (status === 'error' || !artRun) {
    return (
      <main className={styles.page}>
        <p className={styles.stateMessage}>정보를 불러오지 못했어요.</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <KakaoMap
        center={center}
        recenterKey={recenterKey}
        paths={mapPaths}
        markers={markers}
        className={styles.map}
      />

      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(`/art-runs/${id}`)}
          aria-label="뒤로 가기"
        >
          ←
        </button>
        <span className={styles.title}>{artRun.title}</span>
      </header>

      <button
        type="button"
        className={styles.locateButton}
        onClick={handleLocate}
      >
        내 위치
      </button>

      <footer className={styles.footer}>
        {run.error ? <p className={styles.error}>{run.error}</p> : null}

        {isIdle ? <StartButton onClick={handleStart} /> : null}

        {isRunning ? (
          <>
            <RunningStats
              elapsedSeconds={run.elapsedSeconds}
              distance={run.distance}
            />
            <StopButton onClick={handleStop} />
          </>
        ) : null}

        {isFinished ? (
          <>
            <RunningStats
              elapsedSeconds={run.elapsedSeconds}
              distance={run.distance}
            />
            <RunRecordForm onSubmit={handleSaveRecord} />
          </>
        ) : null}
      </footer>

      {closed ? (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <p className={styles.overlayText}>호스트가 러닝을 종료했어요.</p>
            <button
              type="button"
              className={styles.overlayButton}
              onClick={() => navigate(`/art-runs/${id}`, { replace: true })}
            >
              돌아가기
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
