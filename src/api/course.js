import { apiFetch } from './http';

/**
 * AI 코스 추천. 출발 좌표·목표 거리·강도로 순환 코스를 최대 3개 받는다.
 * @param {{ startLat: number, startLng: number, targetDistanceKm: number, intensity: 'EASY' | 'NORMAL' | 'HARD' }} request
 * @returns {Promise<Array<{
 *   rank: number,
 *   distanceKm: number,
 *   elevationGainM: number,
 *   maxSlopePct: number,
 *   predictedHrPct: number,
 *   intensity: string,
 *   reason: string,
 *   geometry: { type: string, coordinates: number[][] },
 * }>>} geometry.coordinates 는 [경도, 위도] 순서
 */
export async function recommendCourses(request) {
  const body = await apiFetch('/api/courses/recommendations', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return body?.data?.courses ?? [];
}
