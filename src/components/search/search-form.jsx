import styles from './search-form.module.css';

export function SearchForm({
  value,
  onChange,
  onSearch,
}) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className={styles.root}>
      <input
        type="search"
        className={styles.input}
        value={value}
        placeholder="검색어를 입력하세요"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        className={styles.button}
        onClick={onSearch}
      >
        검색
      </button>
    </div>
  );
}
