import { formatYmd } from '../../utils/format-date';

import defaultAvatar from '../../assets/runner-man.png';
import styles from './friend-request-item.module.css';

/**
 * 받은 친구 요청 1건 + 수락/거절 버튼.
 * @param {{
 *   nickname: string,
 *   createdAt?: string,
 *   processing?: boolean,
 *   onAccept: () => void,
 *   onReject: () => void,
 * }} props
 */
export default function FriendRequestItem({
  nickname,
  createdAt,
  processing = false,
  onAccept,
  onReject,
}) {
  const requestedAt = formatYmd(createdAt);

  return (
    <li className={styles.item}>
      <img
        className={styles.avatar}
        src={defaultAvatar}
        alt={nickname}
      />
      <div className={styles.body}>
        <span className={styles.nickname}>{nickname}</span>
        {requestedAt ? <span className={styles.time}>{requestedAt}</span> : null}
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.acceptButton}
          disabled={processing}
          onClick={onAccept}
        >
          수락
        </button>
        <button
          type="button"
          className={styles.rejectButton}
          disabled={processing}
          onClick={onReject}
        >
          거절
        </button>
      </div>
    </li>
  );
}
