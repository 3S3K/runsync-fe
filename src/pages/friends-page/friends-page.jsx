import { useNavigate } from 'react-router-dom';

import FriendsListPanel from '../../components/friends/friends-list-panel';
import FriendButton from '../../components/home/FriendButton';
import RunningMap from '../../components/home/RunningMap';
import StatusBadge from '../../components/home/StatusBadge';
import { useFriendsList } from '../../hooks/use-friends-list';

import styles from './friends-page.module.css';

export default function FriendsPage() {
  const navigate = useNavigate();
  const { currentUser, friends } = useFriendsList();

  const handleFriendsClick = () => {
    navigate('/home');
  };

  const handleMyClick = () => {
    navigate('/mypage');
  };

  const handleAddFriend = () => {
    navigate('/search');
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
              <FriendButton onClick={handleFriendsClick} />
            </div>
          </header>
          <RunningMap />
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
