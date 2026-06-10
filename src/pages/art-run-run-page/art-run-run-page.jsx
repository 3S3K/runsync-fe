import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import RunRecordForm from '../../components/home/run-record-form';
import RunningStats from '../../components/home/running-stats';
import StartButton from '../../components/home/StartButton';
import StopButton from '../../components/home/stop-button';
import KakaoMap from '../../components/map/kakao-map';
import { endRunSession } from '../../api/run-session';
import { useActiveRunSession } from '../../hooks/use-active-run-session';
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

  // 진행 중(ACTIVE)인 러닝 세션 감지 (앱 종료/크래시로 남은 세션)
  const { active, status: activeStatus, setActive } = useActiveRunSession();
  const thisId = Number(id);
  const activeForThis = Boolean(
    active && active.artRunSessionId != null && Number(active.artRunSessionId) === thisId,
  );
  const activeOther = Boolean(active && !activeForThis);

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

  // 아트 레이어: 화면에 있는 동안(canRun) 계속 구독해 다른 참가자 위치를 보여주고,
  // 내 위치 발행은 실제로 달릴 때(isRunning)만 한다 (대기/종료 중에도 남들 trail 표시).
  const { paths, markers, closed } = useArtRunRealtime({
    active: canRun,
    sessionId: id,
    myUserId,
    participants,
    position: isRunning ? run.position : null,
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
      // 이 협동 러닝 id 를 넘겨 개인 러닝 기록이 협동 러닝 결과에 연결되도록 한다
      await run.start(Number(id));
    } catch (error) {
      console.error('러닝 시작 실패', error);
      window.alert('러닝을 시작할 수 없어요. 협동 러닝 상태를 확인해 주세요.');
    }
  };

  // 이 협동 러닝에서 진행 중이던 세션을 이어받는다
  const handleResume = () => {
    run.resume(active);
  };

  // 다른 러닝(다른 협동/일반)이 진행 중일 때 → 그 러닝 화면으로 이동
  const handleGoToActive = () => {
    if (active?.artRunSessionId) {
      navigate(`/art-runs/${active.artRunSessionId}/run`);
    } else {
      navigate('/home');
    }
  };

  // 다른 러닝을 종료하고 이 협동 러닝을 새로 시작한다
  const handleEndActiveAndStart = async () => {
    try {
      await endRunSession(active.sessionId, {
        endTime: new Date().toISOString(),
        totalDistance: 0,
      });
      setActive(null);
      await run.start(thisId);
    } catch (error) {
      console.error('기존 러닝 종료/시작 실패', error);
      window.alert('러닝을 시작할 수 없어요. 잠시 후 다시 시도해 주세요.');
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

  // idle 상태에서 보여줄 액션: 이어서 뛰기 / 다른 러닝 안내 / 새로 시작
  let idleActions = null;
  if (isIdle) {
    if (activeStatus === 'loading') {
      idleActions = <p className={styles.hint}>진행 중인 러닝 확인 중...</p>;
    } else if (activeForThis) {
      idleActions = <StartButton onClick={handleResume} label="이어서 뛰기" />;
    } else if (activeOther) {
      idleActions = (
        <div className={styles.notice}>
          <p className={styles.noticeText}>진행 중인 다른 러닝이 있어요.</p>
          <div className={styles.noticeRow}>
            <button
              type="button"
              className={styles.noticeButton}
              onClick={handleGoToActive}
            >
              이어뛰기
            </button>
            <button
              type="button"
              className={styles.noticeButtonPrimary}
              onClick={handleEndActiveAndStart}
            >
              종료하고 시작
            </button>
          </div>
        </div>
      );
    } else {
      idleActions = <StartButton onClick={handleStart} />;
    }
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

        {idleActions}

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
