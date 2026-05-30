const STORAGE_KEY = 'runsync.recent-searches';
export const MAX_RECENT_SEARCHES = 10;

export function readRecentSearches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => typeof item === 'string' && item.trim());
  } catch {
    return [];
  }
}

export function writeRecentSearches(items) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items.slice(0, MAX_RECENT_SEARCHES)),
  );
}

export function upsertRecentSearch(items, term) {
  const trimmed = term.trim();
  if (!trimmed) {
    return items;
  }

  const filtered = items.filter((item) => item !== trimmed);
  return [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
}

export function removeRecentSearch(items, term) {
  return items.filter((item) => item !== term);
}
