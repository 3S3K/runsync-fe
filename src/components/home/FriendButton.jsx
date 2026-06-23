import styles from './FriendButton.module.css';

export default function FriendButton({ onClick }) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onClick}
    >
      <span
        className={styles.iconWrap}
        aria-hidden="true"
      >
        <span className={styles.icon} />
      </span>
      <span className={styles.label}>친구</span>
    </button>
  );
}
