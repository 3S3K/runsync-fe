import styles from './KakaoLoginButton.module.css';

export default function KakaoLoginButton({ onClick }) {
  return (
    <button type="button" className={styles.button} onClick={onClick}>
      <span className={styles.inner}>
        <span className={styles.talkIcon} aria-hidden="true">
          TALK
        </span>
        <span className={styles.label}>카카오로 시작하기</span>
      </span>
    </button>
  );
}
