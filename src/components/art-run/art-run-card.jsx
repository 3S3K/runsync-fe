import { formatYmdHm } from '../../utils/format-date';

import styles from './art-run-card.module.css';

const STATUS_LABEL = {
  RECRUITING: '모집중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
};

const STATUS_CLASS = {
  RECRUITING: 'statusRecruiting',
  IN_PROGRESS: 'statusInProgress',
  COMPLETED: 'statusCompleted',
};

/**
 * 협동 러닝 목록 카드.
 * @param {{ session: object, onClick: () => void }} props
 */
export default function ArtRunCard({ session, onClick }) {
  const {
    title,
    status,
    hostNickname,
    capacity,
    currentCount,
    meetingTime,
    meetingPlaceName,
  } = session;

  const statusClassName = `${styles.status} ${styles[STATUS_CLASS[status]] || ''}`;

  return (
    <li className={styles.card}>
      <button
        type="button"
        className={styles.button}
        onClick={onClick}
      >
        <div className={styles.top}>
          <span className={styles.title}>{title}</span>
          <span className={statusClassName}>{STATUS_LABEL[status] || status}</span>
        </div>
        <div className={styles.meta}>
          <span className={styles.host}>{hostNickname}</span>
          <span className={styles.count}>
            {currentCount}/{capacity}명
          </span>
        </div>
        <div className={styles.sub}>
          <span>{formatYmdHm(meetingTime)}</span>
          <span className={styles.place}>{meetingPlaceName}</span>
        </div>
      </button>
    </li>
  );
}
