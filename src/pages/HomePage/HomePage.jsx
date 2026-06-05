import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RoundIconButton } from '../../components/common/round-icon-button';
import FriendsListPanel from '../../components/friends/friends-list-panel';
import FriendButton from '../../components/home/FriendButton';
import RunningMap from '../../components/home/RunningMap';
import StartButton from '../../components/home/StartButton';
import StatusBadge from '../../components/home/StatusBadge';
import { currentUser, friends } from '../../data/friends';
import { useHomeRunSession } from '../../hooks/use-home-run-session';

import styles from './HomePage.module.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const { isRunning, handleRunButtonClick } = useHomeRunSession();

  const handleMyClick = () => {
    navigate('/mypage');
  };

  const handleFriendsClick = () => {
    setIsFriendsOpen((prev) => !prev);
  };

  const handleAddFriend = () => {};

  const mapSectionClassName = isFriendsOpen
    ? `${styles.mapSection} ${styles.mapSectionCompact}`
    : styles.mapSection;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={mapSectionClassName}>
          <header className={styles.header}>
            <StatusBadge
              temperature="18°"
              location="Seoul"
            />
            <div className={styles.headerRight}>
              <RoundIconButton
                label="MY"
                variant="navy"
                onClick={handleMyClick}
              />
              <FriendButton onClick={handleFriendsClick} />
            </div>
          </header>

          <RunningMap compact={isFriendsOpen} />
        </div>

        {isFriendsOpen ? (
          <FriendsListPanel
            currentUser={currentUser}
            friends={friends}
            onAddFriend={handleAddFriend}
          />
        ) : (
          <footer className={styles.footer}>
            <StartButton
              onClick={handleRunButtonClick}
              label={isRunning ? 'STOP' : 'START'}
            />
          </footer>
        )}
      </div>
    </main>
  );
}
