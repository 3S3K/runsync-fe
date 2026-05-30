import { useCallback, useState } from 'react';

import {
  readRecentSearches,
  removeRecentSearch as removeFromList,
  upsertRecentSearch,
  writeRecentSearches,
} from '../utils/recent-search-storage';

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState(() => readRecentSearches());

  const addRecentSearch = useCallback((term) => {
    setRecentSearches((prev) => {
      const next = upsertRecentSearch(prev, term);
      writeRecentSearches(next);
      return next;
    });
  }, []);

  const removeRecentSearch = useCallback((term) => {
    setRecentSearches((prev) => {
      const next = removeFromList(prev, term);
      writeRecentSearches(next);
      return next;
    });
  }, []);

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
  };
}
