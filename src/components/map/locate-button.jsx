import { MdMyLocation } from 'react-icons/md';

import styles from './locate-button.module.css';

/**
 * 지도 위에 올리는 "내 위치" 버튼. 위치는 부모가 className 으로 정한다.
 * @param {() => void} onClick
 * @param {string} [className] 지도 위 위치를 정하는 클래스
 */
export default function LocateButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`${styles.button} ${className}`}
      onClick={onClick}
    >
      <MdMyLocation
        size={15}
        aria-hidden="true"
      />
      내 위치
    </button>
  );
}
