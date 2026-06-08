import defaultAvatar from '../../assets/runner-man.png';
import styles from './user-search-result.module.css';

const RELATION_LABEL = {
  NONE: '친구 요청',
  REQUEST_SENT: '요청됨',
  REQUEST_RECEIVED: '수락 대기',
  FRIEND: '친구',
};

/**
 * 검색 결과 사용자 1명 + relation 기반 친구 요청 버튼.
 * @param {{ user: object, onRequest: (userId: number) => void }} props
 */
export function UserSearchResult({ user, onRequest, pending = false }) {
  const isActionable = user.relation === 'NONE';
  const label = pending ? '요청 중...' : RELATION_LABEL[user.relation] || '친구 요청';

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultAvatar;
  };

  return (
    <li className={styles.item}>
      <img
        className={styles.avatar}
        src={user.profileImage || defaultAvatar}
        alt={user.nickname}
        onError={handleImageError}
      />
      <span className={styles.nickname}>{user.nickname}</span>
      <button
        type="button"
        className={styles.button}
        disabled={!isActionable || pending}
        onClick={() => onRequest(user.id)}
      >
        {label}
      </button>
    </li>
  );
}
