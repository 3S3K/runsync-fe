import styles from './search-form.module.css';

export function SearchForm({
  value,
  onChange,
  onSearch,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form
      className={styles.root}
      onSubmit={handleSubmit}
    >
      <input
        type="search"
        className={styles.input}
        value={value}
        placeholder="검색어를 입력하세요"
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="submit"
        className={styles.button}
      >
        검색
      </button>
    </form>
  );
}
