import { useEffect, useState } from 'react';
import { MdAutoAwesome } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import { endRunSession } from '../../api/run-session';
import FriendButton from '../../components/home/FriendButton';
import RunningMap from '../../components/home/RunningMap';
import RunRecordForm from '../../components/home/run-record-form';
import RunningStats from '../../components/home/running-stats';
import StartButton from '../../components/home/StartButton';
import StopButton from '../../components/home/stop-button';
import { useActiveRunSession } from '../../hooks/use-active-run-session';
import { useRunRealtime } from '../../hooks/use-run-realtime';
import { useRunTracker } from '../../hooks/use-run-tracker';

import styles from './HomePage.module.css';

export default function HomePage() {
  const navigate = useNavigate();
  const run = useRunTracker();

  const isIdle = run.status === 'idle';
  const isRunning = run.status === 'running';
  const isFinished = run.status === 'finished';

  const realtime = useRunRealtime({
    isRunning,
    sessionId: run.sessionId,
    position: run.position,
  });
  const runError = run.error || realtime.error;

  // 이번 러닝에서 지나온 위치들. 지도에 달린 길을 선으로 그리는 데 쓴다
  const [trail, setTrail] = useState([]);
  const runLat = run.position?.lat;
  const runLng = run.position?.lng;
  useEffect(() => {
    if (!isRunning || runLat == null || runLng == null) {
      return;
    }
    setTrail((prev) => [...prev, { lat: runLat, lng: runLng }]);
  }, [isRunning, runLat, runLng]);
  // 러닝을 마치고 기록 입력까지 끝나면(대기 상태) 선을 지운다
  useEffect(() => {
    if (isIdle) {
      setTrail([]);
    }
  }, [isIdle]);

  // 앱 진입 시 진행 중(ACTIVE) 세션 감지 → 이어뛰기 배너
  const { active, setActive } = useActiveRunSession();
  const [resumeHandled, setResumeHandled] = useState(false);
  const [startError, setStartError] = useState(null);
  const showResumeBanner = Boolean(active) && isIdle && !resumeHandled;

  const handleResumeActive = () => {
    if (active.artRunSessionId) {
      navigate(`/art-runs/${active.artRunSessionId}/run`);
    } else {
      run.resume(active);
      // 이어받은 세션은 이제 추적 훅이 관리한다. 남겨 두면 러닝을 끝낸 뒤 배너가 다시 뜬다
      setActive(null);
    }
  };

  const handleEndActive = async () => {
    try {
      await endRunSession(active.sessionId, {
        endTime: new Date().toISOString(),
        // 그동안 달린 거리를 0 으로 덮어쓰지 않는다
        totalDistance: active.distance ?? 0,
      });
      setActive(null);
      setResumeHandled(true);
    } catch (error) {
      console.error('진행 중 러닝 종료 실패', error);
      window.alert('진행 중인 러닝을 종료하지 못했어요. 다시 시도해 주세요.');
    }
  };

  const handleMyClick = () => {
    navigate('/mypage');
  };

  const handleFriendsClick = () => {
    navigate('/friends');
  };

  const handleStart = async () => {
    setStartError(null);
    try {
      await run.start();
    } catch (error) {
      console.error('러닝 시작 실패', error);
      // 서버가 준 안내(이미 진행 중인 러닝이 있음 등)를 보여준다
      setStartError(error?.message || '러닝을 시작하지 못했어요. 다시 시도해 주세요.');
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
    } catch (error) {
      console.error('기록 저장 실패', error);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.mapSection}>
          <header className={styles.header}>
            {!isRunning ? (
              <div className={styles.headerRight}>
                <button
                  type="button"
                  className={styles.myButton}
                  onClick={handleMyClick}
                >
                  MY
                </button>
                {isIdle ? (
                  <button
                    type="button"
                    className={styles.artRunButton}
                    onClick={() => navigate('/art-runs')}
                  >
                    협동
                  </button>
                ) : null}
                <FriendButton onClick={handleFriendsClick} />
              </div>
            ) : null}
          </header>

          <RunningMap
            position={isIdle ? null : run.position}
            isTracking={!isIdle}
            friendMarkers={realtime.friendMarkers}
            trail={trail}
          />
        </div>

        {isRunning ? (
          <div className={styles.runFooter}>
            {runError ? <p className={styles.runError}>{runError}</p> : null}
            <section className={styles.runPanel} aria-label="러닝 중">
              <RunningStats
                elapsedSeconds={run.elapsedSeconds}
                distance={run.distance}
                compact
              />
              <StopButton onClick={handleStop} />
            </section>
          </div>
        ) : null}

        {isFinished ? (
          <div className={styles.runFooter}>
            {run.error ? <p className={styles.runError}>{run.error}</p> : null}
            <section className={styles.runPanel} aria-label="러닝 완료">
              <RunningStats
                elapsedSeconds={run.elapsedSeconds}
                distance={run.distance}
                compact
              />
              <RunRecordForm onSubmit={handleSaveRecord} />
            </section>
          </div>
        ) : null}

        {isIdle ? (
          <footer className={styles.footer}>
            {startError ? (
              <p
                className={styles.runError}
                role="alert"
              >
                {startError}
              </p>
            ) : null}
            <button
              type="button"
              className={styles.courseButton}
              onClick={() => navigate('/courses')}
            >
              <MdAutoAwesome
                size={16}
                aria-hidden="true"
              />
              AI 코스 추천
            </button>
            {showResumeBanner ? (
              <div className={styles.resumeBanner}>
                <p className={styles.resumeText}>진행 중인 러닝이 있어요. 이어서 뛸까요?</p>
                <div className={styles.resumeRow}>
                  <button
                    type="button"
                    className={styles.resumeButton}
                    onClick={handleEndActive}
                  >
                    종료
                  </button>
                  <button
                    type="button"
                    className={styles.resumeButtonPrimary}
                    onClick={handleResumeActive}
                  >
                    이어서 뛰기
                  </button>
                </div>
              </div>
            ) : (
              <StartButton onClick={handleStart} />
            )}
          </footer>
        ) : null}
      </div>
    </main>
  );
}
