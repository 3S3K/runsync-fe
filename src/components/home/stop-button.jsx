import styles from './stop-button.module.css';

export default function StopButton({ onClick }) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onClick}
    >
      STOP
    </button>
  );
}
