import styles from './StartButton.module.css';

export default function StartButton({ onClick }) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onClick}
    >
      START
    </button>
  );
}
