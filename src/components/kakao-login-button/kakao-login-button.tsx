import styles from './kakao-login-button.module.css';

import kakaoButtonImg from '../../assets/kakao_login_medium_wide.png';

export interface KakaoLoginButtonProps {
  onClick: () => void;
}

export default function KakaoLoginButton({ onClick }: KakaoLoginButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onClick}
    >
      <img
        className={styles.image}
        src={kakaoButtonImg}
        alt="카카오 로그인"
      />
    </button>
  );
}
