import { apiFetch } from './http';

/**
 * 협동 러닝(ArtRun) 세션 목록 조회. (커서 페이지네이션)
 * @param {{ status?: string, cursor?: number, size?: number }} [options]
 *   status: RECRUITING | IN_PROGRESS | COMPLETED
 * @returns {Promise<{
 *   hasNext: boolean,
 *   nextCursor: number,
 *   sessions: Array<{
 *     sessionId: number,
 *     title: string,
 *     status: string,
 *     hostNickname: string,
 *     capacity: number,
 *     currentCount: number,
 *     meetingTime: string,
 *     meetingPlaceName: string,
 *   }>,
 * }>}
 */
export async function getArtRuns({ status = 'RECRUITING', cursor, size } = {}) {
  const params = new URLSearchParams();
  if (status) {
    params.set('status', status);
  }
  if (cursor != null) {
    params.set('cursor', cursor);
  }
  if (size != null) {
    params.set('size', size);
  }

  const body = await apiFetch(`/api/art-runs?${params.toString()}`);
  return body?.data;
}
