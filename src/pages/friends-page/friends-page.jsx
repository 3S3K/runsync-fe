import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FriendsListPanel from '../../components/friends/friends-list-panel';
import FriendButton from '../../components/home/FriendButton';
import RunningMap from '../../components/home/RunningMap';
import StatusBadge from '../../components/home/StatusBadge';
import { currentUser, friends } from '../../data/friends';

import styles from './friends-page.module.css';

export default function FriendsPage() {
  const navigate = useNavigate();
  const [isFriendsOpen] = useState(true);

  const handleFriendsClick = () => {
    navigate('/home');
  };

  const handleAddFriend = () => {};

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={`${styles.mapSection} ${styles.mapSectionCompact}`}>
          <header className={styles.header}>
            <StatusBadge
              temperature="18°"
              location="Seoul"
            />
            <div className={styles.headerRight}>
              <button
                type="button"
                className={styles.myButton}
                onClick={() => navigate('/mypage')}
              >
                MY
              </button>
              <FriendButton onClick={handleFriendsClick} />
            </div>
          </header>
          <RunningMap compact={isFriendsOpen} />
        </div>
        <FriendsListPanel
          currentUser={currentUser}
          friends={friends}
          onAddFriend={handleAddFriend}
        />
      </div>
    </main>
  );
}
