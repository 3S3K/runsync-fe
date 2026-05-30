import { act, renderHook } from '@testing-library/react';

import { useRecentSearches } from './use-recent-searches';

const STORAGE_KEY = 'runsync.recent-searches';

describe('useRecentSearches', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds a search term and moves duplicates to the front', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecentSearch('러닝');
      result.current.addRecentSearch('마라톤');
      result.current.addRecentSearch('러닝');
    });

    expect(result.current.recentSearches).toEqual(['러닝', '마라톤']);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(['러닝', '마라톤']);
  });

  it('keeps at most 10 recent searches', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      for (let index = 1; index <= 11; index += 1) {
        result.current.addRecentSearch(`검색${index}`);
      }
    });

    expect(result.current.recentSearches).toHaveLength(10);
    expect(result.current.recentSearches[0]).toBe('검색11');
  });

  it('removes a single recent search', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecentSearch('러닝');
      result.current.removeRecentSearch('러닝');
    });

    expect(result.current.recentSearches).toEqual([]);
  });
});
