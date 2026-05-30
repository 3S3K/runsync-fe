import FriendListItem from './friend-list-item';
import styles from './friends-list-panel.module.css';

export default function FriendsListPanel({
  currentUser,
  friends,
  onAddFriend,
}) {
  return (
    <section
      className={styles.panel}
      aria-label="나의 친구 목록"
    >
      <div className={styles.header}>
        <h2 className={styles.title}>나의 친구 목록</h2>
        <button
          type="button"
          className={styles.addButton}
          onClick={onAddFriend}
        >
          + 친구 추가
        </button>
      </div>

      <ul className={styles.list}>
        <FriendListItem
          key={currentUser.id}
          name={currentUser.name}
          handle={currentUser.handle}
          status={currentUser.status}
          statusLabel={currentUser.statusLabel}
          avatarSrc={currentUser.avatarSrc}
          isCurrentUser
        />
        {friends.map((friend) => (
          <FriendListItem
            key={friend.id}
            name={friend.name}
            handle={friend.handle}
            status={friend.status}
            statusLabel={friend.statusLabel}
            avatarSrc={friend.avatarSrc}
          />
        ))}
      </ul>
    </section>
  );
}
