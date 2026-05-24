import FriendButton from '../../components/home/FriendButton';
import RunningMap from '../../components/home/RunningMap';
import StartButton from '../../components/home/StartButton';
import StatusBadge from '../../components/home/StatusBadge';

import styles from './HomePage.module.css';

export default function HomePage() {
  const handleMyClick = () => {};

  const handleFriendsClick = () => {};

  const handleStartClick = () => {};

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
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
            <FriendButton onClick={handleFriendsClick} />
          </div>
        </header>

        <RunningMap />

        <footer className={styles.footer}>
          <StartButton onClick={handleStartClick} />
        </footer>
      </div>
    </main>
  );
}
