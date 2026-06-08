import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FriendRequestItem from '../../components/friends/friend-request-item';
import SentRequestItem from '../../components/friends/sent-request-item';
import { useFriendRequests } from '../../hooks/use-friend-requests';

import styles from './friend-requests-page.module.css';

export default function FriendRequestsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('received');
  const {
    received,
    sent,
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

  const isReceived = tab === 'received';
  const isReady = status === 'success';

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
          <h1 className={styles.title}>친구 요청</h1>
        </header>

        <div
          className={styles.tabs}
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isReceived}
            className={isReceived ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setTab('received')}
          >
            받은 요청
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isReceived}
            className={!isReceived ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setTab('sent')}
          >
            보낸 요청
          </button>
        </div>

        {status === 'loading' ? (
          <p className={styles.stateMessage}>불러오는 중...</p>
        ) : null}

        {status === 'error' ? (
          <p className={styles.stateMessage}>{error}</p>
        ) : null}

        {isReady && isReceived && received.length === 0 ? (
          <p className={styles.stateMessage}>받은 친구 요청이 없어요.</p>
        ) : null}

        {isReady && isReceived && received.length > 0 ? (
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

        {isReady && !isReceived && sent.length === 0 ? (
          <p className={styles.stateMessage}>보낸 친구 요청이 없어요.</p>
        ) : null}

        {isReady && !isReceived && sent.length > 0 ? (
          <ul className={styles.list}>
            {sent.map((request) => (
              <SentRequestItem
                key={request.requestId}
                nickname={request.receiverNickname}
                status={request.status}
                createdAt={request.createdAt}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
