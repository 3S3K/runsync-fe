import styles from './KakaoLoginButton.module.css';

function KakaoTalkIcon() {
  return (
    <svg
      className={styles.kakaoIcon}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 3C6.8 3 3 6.1 3 9.8c0 2.2 1.5 4.1 3.8 5.2-.1.6-.5 2.2-.6 2.5-.1.3.1.5.4.5.2 0 .4-.1.9-.4 1-.5 1.7-.9 2.4-1.3 2 .3 4.1.3 6.1 0C18.5 13.9 21 11.9 21 9.8 21 6.1 17.2 3 12 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function KakaoLoginButton({ onClick }) {
  return (
    <button type="button" className={styles.button} onClick={onClick}>
      <span className={styles.inner}>
        <span className={styles.iconWrap} aria-hidden="true">
          <KakaoTalkIcon />
        </span>
        <span className={styles.label}>카카오로 시작하기</span>
      </span>
    </button>
  );
}
