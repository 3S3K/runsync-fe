import { MdMyLocation } from 'react-icons/md';

import styles from './locate-button.module.css';

/**
 * 지도 위에 올리는 "내 위치" 버튼. 위치는 부모가 className 으로 정한다.
 * @param {() => void} onClick
 * @param {boolean} [isLocating] 위치를 조회하는 중이면 버튼을 막아 요청이 겹치지 않게 한다
 * @param {string} [className] 지도 위 위치를 정하는 클래스
 */
export default function LocateButton({ onClick, isLocating = false, className = '' }) {
  return (
    <button
      type="button"
      className={`${styles.button} ${className}`}
      onClick={onClick}
      disabled={isLocating}
    >
      <MdMyLocation
        size={15}
        aria-hidden="true"
      />
      {isLocating ? '확인 중' : '내 위치'}
    </button>
  );
}
