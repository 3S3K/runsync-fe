import { formatYmd } from '../../utils/format-date';

import defaultAvatar from '../../assets/runner-man.png';
import styles from './sent-request-item.module.css';

const STATUS_LABEL = {
  PENDING: '대기중',
  ACCEPTED: '수락됨',
  REJECTED: '거절됨',
};

const STATUS_CLASS = {
  PENDING: 'statusPending',
  ACCEPTED: 'statusAccepted',
  REJECTED: 'statusRejected',
};

/**
 * 보낸 친구 요청 1건 (조회 전용 + 상태 뱃지).
 * @param {{ nickname: string, status: string, createdAt?: string }} props
 */
export default function SentRequestItem({ nickname, status, createdAt }) {
  const requestedAt = formatYmd(createdAt);
  const badgeClassName = `${styles.status} ${styles[STATUS_CLASS[status]] || ''}`;

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
      <span className={badgeClassName}>{STATUS_LABEL[status] || status}</span>
    </li>
  );
}
