import { useNavigate } from 'react-router-dom';

import FriendRequestItem from '../../components/friends/friend-request-item';
import { useFriendRequests } from '../../hooks/use-friend-requests';

import styles from './friend-requests-page.module.css';

export default function FriendRequestsPage() {
  const navigate = useNavigate();
  const {
    received,
    status,
    error,
    processingIds,
    accept,
    reject,
  } = useFriendRequests();

  const handleAccept = async (requestId) => {
    try {
      await accept(requestId);
    } catch {
      window.alert('요청 수락에 실패했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await reject(requestId);
    } catch {
      window.alert('요청 거절에 실패했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate('/friends')}
            aria-label="뒤로 가기"
          >
            ←
          </button>
          <h1 className={styles.title}>받은 친구 요청</h1>
        </header>

        {status === 'loading' ? (
          <p className={styles.stateMessage}>불러오는 중...</p>
        ) : null}

        {status === 'error' ? (
          <p className={styles.stateMessage}>{error}</p>
        ) : null}

        {status === 'success' && received.length === 0 ? (
          <p className={styles.stateMessage}>받은 친구 요청이 없어요.</p>
        ) : null}

        {status === 'success' && received.length > 0 ? (
          <ul className={styles.list}>
            {received.map((request) => (
              <FriendRequestItem
                key={request.requestId}
                nickname={request.senderNickname}
                createdAt={request.createdAt}
                processing={processingIds.includes(request.requestId)}
                onAccept={() => handleAccept(request.requestId)}
                onReject={() => handleReject(request.requestId)}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
