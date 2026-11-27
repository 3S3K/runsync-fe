/** 강도 값과 화면 표기. 설명은 추천 서버의 목표 심박 구간과 같다 */
export const INTENSITY_OPTIONS = [
  {
    value: 'EASY',
    label: '가볍게',
    description: '오르막을 최대한 피하고, 최대 심박의 60~70% 강도에 맞는 코스를 골라요.',
  },
  {
    value: 'NORMAL',
    label: '보통',
    description: '완만한 오르막을 섞어, 최대 심박의 70~80% 강도에 맞는 코스를 골라요.',
  },
  {
    value: 'HARD',
    label: '도전',
    description: '오르막을 포함해, 최대 심박의 80~90% 강도에 맞는 코스를 골라요.',
  },
];

const FITNESS_LEVEL_LABEL = {
  BEGINNER: '초급',
  INTERMEDIATE: '중급',
  ADVANCED: '상급',
};

/**
 * 경사 등급 기준(%). 추천 서버의 기준과 같아야 지도 색과 범례가 어긋나지 않는다.
 * 러너의 언덕 훈련 권장 범위(5~10%)를 가운데 등급으로 삼았다.
 */
const MODERATE_SLOPE_PCT = 5;
const STEEP_SLOPE_PCT = 10;

/** 경사 등급별 색과 이름 (지도 경로, 범례, 고도 차트가 같이 쓴다) */
export const SLOPE_GRADES = {
  FLAT: { label: '완만', range: `${MODERATE_SLOPE_PCT}% 미만`, color: '#22a55b' },
  MODERATE: { label: '언덕', range: `${MODERATE_SLOPE_PCT}~${STEEP_SLOPE_PCT}%`, color: '#f2b01e' },
  STEEP: { label: '급경사', range: `${STEEP_SLOPE_PCT}% 이상`, color: '#d92d20' },
};

export function getIntensityLabel(intensity) {
  return INTENSITY_OPTIONS.find((option) => option.value === intensity)?.label ?? '';
}

export function getFitnessLevelLabel(fitnessLevel) {
  return FITNESS_LEVEL_LABEL[fitnessLevel] ?? '';
}

/** 380 → 6'20" */
export function formatPace(secPerKm) {
  if (secPerKm == null) {
    return '–';
  }
  // 359.8 → 6'00" 이 되도록 전체 초를 먼저 반올림한다
  const totalSeconds = Math.round(secPerKm);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}'${seconds}"`;
}

/** '2026-11-12' → '11.12' */
export function formatShortDate(isoDate) {
  const [, month, day] = (isoDate ?? '').split('-');
  if (!month || !day) {
    return '';
  }
  return `${Number(month)}.${Number(day)}`;
}

/** 경사(%)의 절댓값으로 등급을 정한다 */
export function getSlopeGrade(slopePct) {
  const steepness = Math.abs(slopePct);
  if (steepness < MODERATE_SLOPE_PCT) {
    return 'FLAT';
  }
  if (steepness < STEEP_SLOPE_PCT) {
    return 'MODERATE';
  }
  return 'STEEP';
}
