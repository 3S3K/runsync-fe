import { getDistanceKm } from './distance';

const MIN_POINT_DISTANCE_KM = 0.005; // 5m — 정지/흔들림 GPS 노이즈 제거 간격
const MAX_JUMP_KM = 0.08; // 80m — 연속 샘플 사이 이동으로 불가능한 거리(GPS 튐)
const SPIKE_DETOUR_KM = 0.02; // 20m — 직전→현재→다음 우회가 직전→다음보다 이만큼 길면 혼자 삐져나온 튐
const CHAIKIN_ITERATIONS = 2;

// 0) 튀는 점(아웃라이어) 제거: 직전 점에서 비현실적으로 멀거나, 혼자 삐져나왔다 돌아오는 점을 버린다.
//    첫 점과 끝 점은 항상 보존한다.
function dropSpikes(points) {
  const result = [points[0]];
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = result[result.length - 1];
    const cur = points[i];
    const next = points[i + 1];

    const jump = getDistanceKm(prev, cur);
    const detour = jump + getDistanceKm(cur, next);
    const direct = getDistanceKm(prev, next);

    if (jump > MAX_JUMP_KM || detour - direct > SPIKE_DETOUR_KM) {
      continue;
    }
    result.push(cur);
  }
  result.push(points[points.length - 1]);
  return result;
}

// 1) 직전 점과 너무 가까운 점 제거 (정지 상태 떨림 등). 첫 점과 끝 점은 항상 보존한다.
function dropNoise(points) {
  const result = [points[0]];
  for (let i = 1; i < points.length - 1; i += 1) {
    const last = result[result.length - 1];
    if (getDistanceKm(last, points[i]) >= MIN_POINT_DISTANCE_KM) {
      result.push(points[i]);
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

// 2) Chaikin 모서리 깎기: 각 구간을 25%/75% 지점 두 점으로 대체해 곡선을 부드럽게 한다.
function chaikin(points) {
  if (points.length <= 2) {
    return points;
  }

  const result = [points[0]];
  for (let i = 0; i < points.length - 1; i += 1) {
    const p = points[i];
    const q = points[i + 1];
    result.push({ lat: p.lat * 0.75 + q.lat * 0.25, lng: p.lng * 0.75 + q.lng * 0.25 });
    result.push({ lat: p.lat * 0.25 + q.lat * 0.75, lng: p.lng * 0.25 + q.lng * 0.75 });
  }
  result.push(points[points.length - 1]);
  return result;
}

/**
 * GPS 경로를 표시용으로 부드럽게 다듬는다 (노이즈 제거 + Chaikin 스무딩).
 * 원본 좌표/거리 계산에는 영향을 주지 않는다.
 * @param {Array<{ lat: number, lng: number }>} points
 * @returns {Array<{ lat: number, lng: number }>}
 */
export function smoothPath(points) {
  if (!points || points.length <= 2) {
    return points || [];
  }

  let result = dropNoise(dropSpikes(points));
  for (let i = 0; i < CHAIKIN_ITERATIONS; i += 1) {
    result = chaikin(result);
  }
  return result;
}
