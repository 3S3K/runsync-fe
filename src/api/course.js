import { apiFetch } from './http';

/**
 * AI 코스 추천. 출발 좌표·목표 거리·강도로 순환 코스를 최대 3개 받는다.
 * @param {{ startLat: number, startLng: number, targetDistanceKm: number, intensity: 'EASY' | 'NORMAL' | 'HARD' }} request
 * @returns {Promise<Array<{
 *   rank: number,
 *   name: string | null,
 *   score: number | null,
 *   distanceKm: number,
 *   elevationGainM: number,
 *   maxSlopePct: number,
 *   predictedHrPct: number,
 *   intensity: string,
 *   reason: string,
 *   geometry: { type: string, coordinates: number[][] },
 *   elevationProfile: Array<{ distanceM: number, elevationM: number }>,
 *   estimatedTimeMin: number | null,
 *   stairsCount: number | null,
 *   hrZone: string | null,
 *   hrBpmRange: number[] | null,
 *   biggestClimb: { startM: number, lengthM: number, gainM: number } | null,
 *   slopeSegments: Array<{ grade: 'FLAT' | 'MODERATE' | 'STEEP', coordinates: number[][] }>,
 * }>>} 좌표는 모두 [경도, 위도] 순서
 */
export async function recommendCourses(request) {
  const body = await apiFetch('/api/courses/recommendations', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return body?.data?.courses ?? [];
}

/**
 * 내 러닝 분석. 코스 추천에 반영되는 최근 러닝 기록(최대 5회)의 요약.
 * @returns {Promise<{
 *   recordCount: number,
 *   averagePaceSecPerKm: number | null,
 *   averageHeartRate: number | null,
 *   averageCadence: number | null,
 *   averageDistanceKm: number | null,
 *   weeklyDistanceKm: number,
 *   fitnessLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null,
 *   recentRuns: Array<{ date: string, distanceKm: number }>,
 * } | null>} recentRuns 는 오래된 순
 */
export async function getRunnerSummary() {
  const body = await apiFetch('/api/courses/runner-summary');
  return body?.data ?? null;
}
