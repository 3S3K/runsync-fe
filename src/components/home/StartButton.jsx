import styles from './StartButton.module.css';

export default function StartButton({ onClick, label = 'START' }) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
