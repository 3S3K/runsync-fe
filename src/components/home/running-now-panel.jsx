import styles from './running-now-panel.module.css';

export default function RunningNowPanel({ children }) {
  return (
    <section
      className={styles.panel}
      aria-label="Running now"
    >
      <h2 className={styles.title}>Running now</h2>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
