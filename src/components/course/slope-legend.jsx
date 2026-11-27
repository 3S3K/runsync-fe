import { SLOPE_GRADES } from '../../utils/course-format';

import styles from './slope-legend.module.css';

/** 지도 경로의 경사 등급별 색 안내. */
export default function SlopeLegend() {
  return (
    <ul
      className={styles.legend}
      aria-label="경사 등급 색 안내"
    >
      {Object.entries(SLOPE_GRADES).map(([grade, info]) => (
        <li
          key={grade}
          className={styles.item}
        >
          <span
            className={styles.swatch}
            style={{ backgroundColor: info.color }}
          />
          {info.label}
          <span className={styles.range}>{info.range}</span>
        </li>
      ))}
    </ul>
  );
}
