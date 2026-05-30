import { useState } from 'react';

import { RecentSearchList } from '../../components/search/recent-search-list';
import { SearchForm } from '../../components/search/search-form';
import { useRecentSearches } from '../../hooks/use-recent-searches';

import styles from './search-page.module.css';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
  } = useRecentSearches();

  const handleSearch = () => {
    addRecentSearch(query);
  };

  const handleSelectRecent = (term) => {
    setQuery(term);
  };

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
      </section>
    </main>
  );
}
