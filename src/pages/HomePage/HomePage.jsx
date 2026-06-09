import { useNavigate } from 'react-router-dom';

import FriendButton from '../../components/home/FriendButton';
import RunningMap from '../../components/home/RunningMap';
import RunRecordForm from '../../components/home/run-record-form';
import RunningNowPanel from '../../components/home/running-now-panel';
import RunningNowProfile from '../../components/home/running-now-profile';
import RunningStats from '../../components/home/running-stats';
import StartButton from '../../components/home/StartButton';
import StatusBadge from '../../components/home/StatusBadge';
import StopButton from '../../components/home/stop-button';
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
            <StartButton onClick={handleStart} />
          </footer>
        ) : null}
      </div>
    </main>
  );
}
