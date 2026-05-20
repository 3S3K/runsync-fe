import styles from './recent-search-list.module.css';

export function RecentSearchList({
  items,
  onSelect,
  onRemove,
}) {
  if (items.length === 0) {
    return (
      <p className={styles.empty}>최근 검색어가 없어요.</p>
    );
  }

  return (
    <ul className={styles.list}>
      {items.map((term) => (
        <li
          key={term}
          className={styles.item}
        >
          <button
            type="button"
            className={styles.termButton}
            onClick={() => onSelect(term)}
          >
            {term}
          </button>
          <button
            type="button"
            className={styles.removeButton}
            aria-label={`${term} 삭제`}
            onClick={() => onRemove(term)}
          >
            삭제
          </button>
        </li>
      ))}
    </ul>
  );
}
