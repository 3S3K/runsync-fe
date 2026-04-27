import styles from './KakaoLoginButton.module.css';
import kakaoButtonImg from '../../assets/kakao_login_medium_wide.png';

export default function KakaoLoginButton({ onClick }) {
  return (
    <button type="button" className={styles.button} onClick={onClick}>
      <img className={styles.image} src={kakaoButtonImg} alt="카카오 로그인" />
    </button>
  );
}

