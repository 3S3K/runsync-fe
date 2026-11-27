import { getDistanceKm } from './distance';
import { smoothPath } from './smooth-path';

const START = { lat: 36.3321, lng: 127.4562 };
const STEP_LAT = 0.0001; // 북쪽으로 약 11m
const WOBBLE_LNG = 0.00008; // 동서로 약 7m

// 북쪽으로 곧게 걷는데 GPS 가 좌우로 번갈아 흔들린 경로
function zigzag(count) {
  return Array.from({ length: count }, (_, index) => ({
    lat: START.lat + STEP_LAT * index,
    lng: START.lng + (index % 2 === 0 ? WOBBLE_LNG : -WOBBLE_LNG),
  }));
}

// 경로가 남북 방향이므로 기준 경도에서 벗어난 정도가 좌우 흔들림이다
function maxSidewaysOffsetM(points) {
  return Math.max(...points.map((point) => getDistanceKm(point, { lat: point.lat, lng: START.lng }) * 1000));
}

// 양 끝은 원래 위치를 유지하므로, 가운데 구간으로 비교한다
function middle(points) {
  return points.slice(Math.floor(points.length * 0.2), Math.ceil(points.length * 0.8));
}

describe('smoothPath', () => {
  it('좌우로 흔들리는 경로의 흔들림을 줄인다', () => {
    const raw = zigzag(20);

    const before = maxSidewaysOffsetM(middle(raw));
    const after = maxSidewaysOffsetM(middle(smoothPath(raw)));

    expect(before).toBeGreaterThan(6);
    expect(after).toBeLessThan(before / 2);
  });

  it('첫 점과 끝 점은 그대로 둔다', () => {
    const raw = zigzag(12);
    const smoothed = smoothPath(raw);

    expect(smoothed[0]).toEqual(raw[0]);
    expect(smoothed[smoothed.length - 1]).toEqual(raw[raw.length - 1]);
  });

  it('곧은 경로는 곧게 유지한다', () => {
    const straight = Array.from({ length: 10 }, (_, index) => ({
      lat: START.lat + STEP_LAT * index,
      lng: START.lng,
    }));

    expect(maxSidewaysOffsetM(smoothPath(straight))).toBeLessThan(0.01);
  });

  it('점이 2개 이하면 그대로 돌려준다', () => {
    const two = zigzag(2);

    expect(smoothPath(two)).toEqual(two);
    expect(smoothPath([])).toEqual([]);
    expect(smoothPath(null)).toEqual([]);
  });
});
