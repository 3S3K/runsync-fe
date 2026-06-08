import FriendListItem from './friend-list-item';
import styles from './friends-list-panel.module.css';

export default function FriendsListPanel({
  currentUser,
  friends,
  onAddFriend,
  onRemoveFriend,
  onViewRequests,
}) {
  return (
    <section
      className={styles.panel}
      aria-label="나의 친구 목록"
    >
      <div className={styles.header}>
        <h2 className={styles.title}>나의 친구 목록</h2>
        <div className={styles.headerActions}>
          {onViewRequests ? (
            <button
              type="button"
              className={styles.requestsButton}
              onClick={onViewRequests}
            >
              받은 요청
            </button>
          ) : null}
          <button
            type="button"
            className={styles.addButton}
            onClick={onAddFriend}
          >
            + 친구 추가
          </button>
        </div>
      </div>

      <ul className={styles.list}>
        {currentUser ? (
          <FriendListItem
            key={currentUser.id}
            name={currentUser.name}
            status={currentUser.status}
            statusLabel={currentUser.statusLabel}
            avatarSrc={currentUser.avatarSrc}
            isCurrentUser
          />
        ) : null}
        {friends.map((friend) => (
          <FriendListItem
            key={friend.id}
            name={friend.name}
            status={friend.status}
            statusLabel={friend.statusLabel}
            avatarSrc={friend.avatarSrc}
            onDelete={() => onRemoveFriend(friend.id)}
          />
        ))}
      </ul>
    </section>
  );
}
