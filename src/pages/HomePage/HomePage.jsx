import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { endRunSession } from '../../api/run-session';
import FriendButton from '../../components/home/FriendButton';
import RunningMap from '../../components/home/RunningMap';
import RunRecordForm from '../../components/home/run-record-form';
import RunningNowPanel from '../../components/home/running-now-panel';
import RunningNowProfile from '../../components/home/running-now-profile';
import RunningStats from '../../components/home/running-stats';
import StartButton from '../../components/home/StartButton';
import StatusBadge from '../../components/home/StatusBadge';
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

  // 앱 진입 시 진행 중(ACTIVE) 세션 감지 → 이어뛰기 배너
  const { active, setActive } = useActiveRunSession();
  const [resumeHandled, setResumeHandled] = useState(false);
  const showResumeBanner = Boolean(active) && isIdle && !resumeHandled;

  const handleResumeActive = () => {
    if (active.artRunSessionId) {
      navigate(`/art-runs/${active.artRunSessionId}/run`);
    } else {
      run.resume(active);
    }
  };

  const handleEndActive = async () => {
    try {
      await endRunSession(active.sessionId, {
        endTime: new Date().toISOString(),
        totalDistance: 0,
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
    } catch (error) {
      console.error('기록 저장 실패', error);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.mapSection}>
          <header className={styles.header}>
            <StatusBadge
              temperature="18°"
              location="Seoul"
            />
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
          />
        </div>

        {isRunning ? (
          <div className={styles.runFooter}>
            {runError ? <p className={styles.runError}>{runError}</p> : null}
            <RunningNowPanel>
              <RunningNowProfile statusLabel="현재 러닝 중" />
              <RunningStats
                elapsedSeconds={run.elapsedSeconds}
                distance={run.distance}
              />
              <StopButton onClick={handleStop} />
            </RunningNowPanel>
          </div>
        ) : null}

        {isFinished ? (
          <div className={styles.runFooter}>
            {run.error ? <p className={styles.runError}>{run.error}</p> : null}
            <RunningNowPanel>
              <RunningNowProfile
                statusLabel="러닝 종료"
                muted
              />
              <RunningStats
                elapsedSeconds={run.elapsedSeconds}
                distance={run.distance}
              />
              <RunRecordForm onSubmit={handleSaveRecord} />
            </RunningNowPanel>
          </div>
        ) : null}

        {isIdle ? (
          <footer className={styles.footer}>
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
