import { useNavigate } from 'react-router-dom';

import FriendsListPanel from '../../components/friends/friends-list-panel';
import FriendButton from '../../components/home/FriendButton';
import RunningMap from '../../components/home/RunningMap';
import StatusBadge from '../../components/home/StatusBadge';
import { useFriends } from '../../hooks/use-friends';
import { getFriendStatusLabel, toFriendStatus } from '../../utils/friend-status';

import styles from './friends-page.module.css';

export default function FriendsPage() {
  const navigate = useNavigate();
  const { me, friends, status, error, removeFriend } = useFriends();

  const currentUser = me
    ? {
        id: me.id,
        name: me.nickname,
        status: 'me',
        statusLabel: '나',
        avatarSrc: me.profileImage,
      }
    : null;

  const friendItems = friends.map((friend) => ({
    id: friend.friendUserId,
    name: friend.nickname,
    status: toFriendStatus(friend.activityStatus),
    statusLabel: getFriendStatusLabel(friend.activityStatus),
    avatarSrc: friend.profileImage,
  }));

  const handleRemoveFriend = async (friendUserId) => {
    if (!window.confirm('친구를 삭제할까요?')) {
      return;
    }

    try {
      await removeFriend(friendUserId);
    } catch {
      // 삭제 실패 안내는 추후 토스트로 보강
    }
  };

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
              <FriendButton onClick={() => navigate('/home')} />
            </div>
          </header>
          <RunningMap />
        </div>

        {status === 'loading' ? (
          <div className={styles.stateMessage}>친구 목록을 불러오는 중...</div>
        ) : null}

        {status === 'error' ? (
          <div className={styles.stateMessage}>{error}</div>
        ) : null}

        {status === 'success' ? (
          <FriendsListPanel
            currentUser={currentUser}
            friends={friendItems}
            onAddFriend={() => navigate('/search')}
            onRemoveFriend={handleRemoveFriend}
          />
        ) : null}
      </div>
    </main>
  );
}
