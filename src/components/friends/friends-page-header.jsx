import styles from './friends-page-header.module.css';

export default function FriendsPageHeader({ onBack }) {
  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.backButton}
        aria-label="뒤로 가기"
        onClick={onBack}
      >
        ←
      </button>
      <h1 className={styles.title}>친구</h1>
      <span
        className={styles.spacer}
        aria-hidden="true"
      />
    </header>
  );
}
