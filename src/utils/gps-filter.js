import { getDistanceKm } from './distance';

/** 이보다 오차가 큰 위치는 경로와 거리에 쓰지 않는다. 폰 GPS 는 건물 옆에서 수십 m 까지 흔들린다 */
export const MAX_ACCURACY_M = 30;
/** 사람이 달려서 낼 수 없는 속도(시속 36km). 이보다 빠르게 옮겨 간 위치는 튄 값으로 본다 */
export const MAX_SPEED_MPS = 10;

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
