import { getDistanceKm } from './distance';

/** 이보다 오차가 큰 위치는 경로와 거리에 쓰지 않는다. 폰 GPS 는 건물 옆에서 수십 m 까지 흔들린다 */
export const MAX_ACCURACY_M = 30;
/** 사람이 달려서 낼 수 없는 속도(시속 36km). 이보다 빠르게 옮겨 간 위치는 튄 값으로 본다 */
export const MAX_SPEED_MPS = 10;

/** 측정 시각을 쓸 수 없을 때, 받은 시각으로 계산하는 간격의 최솟값(초). 몰아서 전달된 위치의 간격이 0 이 되지 않게 한다 */
const MIN_RECEIVED_GAP_SEC = 1;

/**
 * 두 측정 사이에 실제로 지난 시간(초).
 * 위치를 취득한 시각(measuredAt)의 차이를 쓴다. 차이만 쓰므로 브라우저마다 시각의 기준점이 달라도 상관없다.
 * 측정 시각이 없거나 앞뒤가 뒤집힌 경우에만 위치를 전달받은 시각(receivedAt)의 차이로 대신한다.
 * @param {{ measuredAt?: number | null, receivedAt: number }} previous 직전 측정 (밀리초)
 * @param {{ measuredAt?: number | null, receivedAt: number }} current 이번 측정 (밀리초)
 * @returns {number}
 */
export function getElapsedSec(previous, current) {
  // 두 값이 모두 숫자인지 먼저 확인한다. null 은 뺄셈에서 0 으로 바뀌어 간격이 엉뚱하게 커진다
  if (Number.isFinite(previous.measuredAt) && Number.isFinite(current.measuredAt)) {
    const measuredGapSec = (current.measuredAt - previous.measuredAt) / 1000;
    if (measuredGapSec > 0) {
      return measuredGapSec;
    }
  }
  return Math.max((current.receivedAt - previous.receivedAt) / 1000, MIN_RECEIVED_GAP_SEC);
}

/**
 * 새로 받은 위치를 믿고 쓸 수 있는지 판단한다.
 * @param {{
 *   accuracy?: number | null,                       // 브라우저가 알려 준 오차 반경(m)
 *   last?: { lat: number, lng: number } | null,     // 직전에 채택한 위치
 *   next: { lat: number, lng: number },             // 새로 받은 위치
 *   elapsedSec?: number,                            // 직전에 채택한 위치로부터 지난 시간(초)
 * }} fix
 * @returns {boolean}
 */
export function isReliableFix({ accuracy = null, last = null, next, elapsedSec = 0 }) {
  if (accuracy != null && accuracy > MAX_ACCURACY_M) {
    return false;
  }

  // 신호가 끊겼다 돌아온 경우는 지난 시간이 길어 속도가 낮게 나오므로 통과한다
  if (last && elapsedSec > 0) {
    const speedMps = (getDistanceKm(last, next) * 1000) / elapsedSec;
    if (speedMps > MAX_SPEED_MPS) {
      return false;
    }
  }

  return true;
}
