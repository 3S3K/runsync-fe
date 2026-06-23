import { useRef, useState } from 'react';

import FriendListItem from './friend-list-item';
import styles from './friends-list-panel.module.css';

const CLOSE_THRESHOLD_PX = 100;

export default function FriendsListPanel({
  currentUser,
  friends,
  onAddFriend,
  onRemoveFriend,
  onViewRequests,
  onClose,
}) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);

  const handlePointerDown = (event) => {
    startYRef.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) {
      return;
    }
    // 아래로 끄는 동작만 따라가게 한다 (위로는 무시)
    setDragY(Math.max(0, event.clientY - startYRef.current));
  };

  const handlePointerUp = () => {
    if (!isDragging) {
      return;
    }
    setIsDragging(false);

    // 일정 거리 이상 내리면 닫고, 아니면 원위치로 스냅백
    if (dragY > CLOSE_THRESHOLD_PX && onClose) {
      onClose();
      return;
    }
    setDragY(0);
  };

  return (
    <section
      className={styles.panel}
      aria-label="나의 친구 목록"
      style={{
        transform: `translateY(${dragY}px)`,
        transition: isDragging ? 'none' : 'transform 0.25s ease',
      }}
    >
      <div
        className={styles.dragHandle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <span className={styles.grabber} aria-hidden="true" />
      </div>

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
