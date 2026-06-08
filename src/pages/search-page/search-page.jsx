import { useState } from 'react';

import { RecentSearchList } from '../../components/search/recent-search-list';
import { SearchForm } from '../../components/search/search-form';
import { UserSearchResult } from '../../components/search/user-search-result';
import { useRecentSearches } from '../../hooks/use-recent-searches';
import { useUserSearch } from '../../hooks/use-user-search';

import styles from './search-page.module.css';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
  } = useRecentSearches();
  const {
    users,
    status,
    error,
    hasNext,
    requestingIds,
    search,
    loadMore,
    requestFriend,
  } = useUserSearch();

  const runSearch = (term) => {
    const trimmed = term.trim();
    if (!trimmed) {
      return;
    }

    addRecentSearch(trimmed);
    search(trimmed);
  };

  const handleSearch = () => {
    runSearch(query);
  };

  const handleSelectRecent = (term) => {
    setQuery(term);
    runSearch(term);
  };

  const handleRequest = async (userId) => {
    try {
      await requestFriend(userId);
    } catch {
      window.alert('친구 요청에 실패했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const showResults = status !== 'idle' && query.trim() !== '';

  return (
    <main className={styles.root}>
      <section
        className={styles.content}
        aria-label="검색"
      >
        <h1 className={styles.title}>검색</h1>

        <SearchForm
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
        />

        {showResults ? (
          <section
            className={styles.resultSection}
            aria-label="검색 결과"
          >
            {status === 'loading' ? (
              <p className={styles.stateMessage}>검색 중...</p>
            ) : null}
            {status === 'error' ? (
              <p className={styles.stateMessage}>{error}</p>
            ) : null}
            {status === 'success' && users.length === 0 ? (
              <p className={styles.stateMessage}>검색 결과가 없어요.</p>
            ) : null}
            {status === 'success' && users.length > 0 ? (
              <>
                <ul className={styles.resultList}>
                  {users.map((user) => (
                    <UserSearchResult
                      key={user.id}
                      user={user}
                      pending={requestingIds.includes(user.id)}
                      onRequest={handleRequest}
                    />
                  ))}
                </ul>
                {hasNext ? (
                  <button
                    type="button"
                    className={styles.moreButton}
                    onClick={loadMore}
                  >
                    더 보기
                  </button>
                ) : null}
              </>
            ) : null}
          </section>
        ) : (
          <section
            className={styles.recentSection}
            aria-label="최근 검색어"
          >
            <h2 className={styles.recentTitle}>최근 검색어</h2>
            <RecentSearchList
              items={recentSearches}
              onSelect={handleSelectRecent}
              onRemove={removeRecentSearch}
            />
          </section>
        )}
      </section>
    </main>
  );
}
