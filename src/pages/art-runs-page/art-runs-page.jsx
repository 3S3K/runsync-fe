import { useNavigate } from 'react-router-dom';

import ArtRunCard from '../../components/art-run/art-run-card';
import { useArtRuns } from '../../hooks/use-art-runs';

import styles from './art-runs-page.module.css';

const FILTERS = [
  { value: 'RECRUITING', label: '모집중' },
  { value: 'IN_PROGRESS', label: '진행중' },
  { value: 'COMPLETED', label: '완료' },
];

export default function ArtRunsPage() {
  const navigate = useNavigate();
  // TODO(#37): 생성 라우트 생기면 navigate로 교체
  const handleNotReady = () => {
    window.alert('준비 중인 기능이에요.');
  };

  const {
    sessions,
    statusFilter,
    setStatusFilter,
    status,
    error,
    hasNext,
    isLoadingMore,
    loadMore,
  } = useArtRuns();

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.title}>협동 러닝</h1>
          <button
            type="button"
            className={styles.createButton}
            onClick={handleNotReady}
          >
            + 만들기
          </button>
        </header>

        <div
          className={styles.tabs}
          role="tablist"
        >
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={statusFilter === filter.value}
              className={
                statusFilter === filter.value
                  ? `${styles.tab} ${styles.tabActive}`
                  : styles.tab
              }
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {status === 'loading' ? (
          <p className={styles.stateMessage}>불러오는 중...</p>
        ) : null}

        {status === 'error' ? (
          <p className={styles.stateMessage}>{error}</p>
        ) : null}

        {status === 'success' && sessions.length === 0 ? (
          <p className={styles.stateMessage}>해당 상태의 협동 러닝이 없어요.</p>
        ) : null}

        {status === 'success' && sessions.length > 0 ? (
          <>
            <ul className={styles.list}>
              {sessions.map((session) => (
                <ArtRunCard
                  key={session.sessionId}
                  session={session}
                  onClick={() => navigate(`/art-runs/${session.sessionId}`)}
                />
              ))}
            </ul>
            {hasNext ? (
              <button
                type="button"
                className={styles.moreButton}
                disabled={isLoadingMore}
                onClick={loadMore}
              >
                {isLoadingMore ? '로딩 중...' : '더 보기'}
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}
