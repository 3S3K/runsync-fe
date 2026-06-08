import styles from './login-pixel-map.module.css';

const POTATO_PATH = `
  M 118 188
  C 72 188, 48 158, 52 122
  C 56 86, 88 62, 128 58
  C 168 54, 212 72, 232 104
  C 252 136, 244 172, 206 188
  C 168 204, 142 192, 118 188
  Z
`;

function PixelRunnerMale() {
  return (
    <svg className={styles.runnerMale} viewBox="0 0 32 36" aria-hidden="true">
      <rect x="12" y="2" width="8" height="3" fill="#ff4d4d" />
      <rect x="11" y="5" width="10" height="3" fill="#2b2b2b" />
      <rect x="13" y="8" width="6" height="5" fill="#ffd0b0" />
      <rect x="10" y="13" width="12" height="8" fill="#ffffff" />
      <rect x="10" y="16" width="12" height="2" fill="#ff4d4d" />
      <rect x="11" y="21" width="4" height="6" fill="#3f74c9" />
      <rect x="17" y="21" width="4" height="6" fill="#3f74c9" />
      <rect x="10" y="27" width="5" height="3" fill="#ffffff" />
      <rect x="17" y="27" width="5" height="3" fill="#ffffff" />
      <rect x="9" y="30" width="6" height="2" fill="#ffd84d" />
      <rect x="17" y="30" width="6" height="2" fill="#ffd84d" />
    </svg>
  );
}

function PixelRunnerFemale() {
  return (
    <svg className={styles.runnerFemale} viewBox="0 0 32 36" aria-hidden="true">
      <rect x="10" y="2" width="12" height="4" fill="#ffd84d" />
      <rect x="11" y="6" width="10" height="4" fill="#7a4b2f" />
      <rect x="13" y="10" width="6" height="5" fill="#ffd0b0" />
      <rect x="10" y="15" width="12" height="8" fill="#ffffff" />
      <rect x="11" y="23" width="4" height="7" fill="#45b85a" />
      <rect x="17" y="23" width="4" height="7" fill="#45b85a" />
      <rect x="11" y="24" width="1" height="5" fill="#ffffff" />
      <rect x="20" y="24" width="1" height="5" fill="#ffffff" />
      <rect x="10" y="30" width="5" height="2" fill="#3f74c9" />
      <rect x="17" y="30" width="5" height="2" fill="#3f74c9" />
    </svg>
  );
}

export default function LoginPixelMap() {
  return (
    <div className={styles.mapWrap} aria-hidden="true">
      <svg
        className={styles.mapSvg}
        viewBox="0 0 360 250"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="고구마 코스 GPS 아트 지도"
      >
        <rect width="360" height="250" fill="#d4efbf" />

        <path
          d="M0 0 H360 V78 C320 92 260 68 190 74 C120 80 70 58 0 66 Z"
          fill="#a8ddf2"
        />
        <path
          d="M0 168 C48 160 88 176 120 250 H0 Z"
          fill="#a8ddf2"
        />
        <ellipse cx="228" cy="48" rx="34" ry="10" fill="#8fd49a" />

        <path
          d="M0 118 H360 M0 148 H360 M72 0 V250 M168 0 V250 M264 0 V250"
          stroke="#ffc978"
          strokeWidth="3"
          opacity="0.85"
        />
        <path
          d="M40 92 L120 110 L210 96 L300 118"
          stroke="#ffc978"
          strokeWidth="3"
          opacity="0.85"
        />
        <path
          d="M80 170 L170 150 L260 168"
          stroke="#ffc978"
          strokeWidth="3"
          opacity="0.85"
        />

        <path
          d="M250 36 C280 52 292 74 286 98"
          stroke="#58b7ea"
          strokeWidth="4"
          strokeDasharray="8 8"
          fill="none"
          strokeLinecap="round"
        />

        <rect x="54" y="132" width="16" height="12" fill="#b8dcc0" rx="2" />
        <rect x="286" y="156" width="18" height="14" fill="#b8dcc0" rx="2" />

        <polygon points="62,128 68,116 74,128" fill="#6fbf78" />
        <polygon points="66,124 70,114 74,124" fill="#8fd49a" />
        <rect x="64" y="128" width="4" height="5" fill="#6ea874" />

        <polygon points="292,152 298,140 304,152" fill="#6fbf78" />
        <polygon points="296,148 300,138 304,148" fill="#8fd49a" />
        <rect x="298" y="152" width="4" height="5" fill="#6ea874" />

        <polygon points="148,92 154,80 160,92" fill="#6fbf78" />
        <rect x="152" y="92" width="4" height="5" fill="#6ea874" />

        <path d={POTATO_PATH} fill="#ffc44d" stroke="#6d478c" strokeWidth="8" strokeLinejoin="round" />

        <text
          x="142"
          y="128"
          textAnchor="middle"
          className={styles.courseKmText}
        >
          8km
        </text>
        <text
          x="142"
          y="150"
          textAnchor="middle"
          className={styles.courseNameText}
        >
          고구마 코스
        </text>

        <circle cx="228" cy="118" r="7" fill="#ff4d4d" stroke="#ffffff" strokeWidth="2" />
      </svg>

      <PixelRunnerMale />
      <PixelRunnerFemale />
      <span className={styles.sparkleOne} />
      <span className={styles.sparkleTwo} />
    </div>
  );
}
