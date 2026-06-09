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

/**
 * 협동 러닝 세션 생성.
 * @param {{
 *   title: string,
 *   capacity: number,
 *   meetingTime: string,
 *   meetingPlace: { name: string, latitude: number, longitude: number },
 *   coordinates: Array<{ latitude: number, longitude: number }>,
 * }} payload
 * @returns {Promise<{ sessionId: number }>}
 */
export async function createArtRun(payload) {
  const body = await apiFetch('/api/art-runs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return body?.data;
}

/**
 * 협동 러닝 세션 상세 조회.
 * @param {number} sessionId
 * @returns {Promise<{
 *   sessionId: number,
 *   title: string,
 *   status: string,
 *   host: { userId: number, nickname: string },
 *   coordinates: Array<{ latitude: number, longitude: number }>,
 *   capacity: number,
 *   currentCount: number,
 *   meetingTime: string,
 *   meetingPlace: { name: string, latitude: number, longitude: number },
 *   participants: Array<{ userId: number, nickname: string, profileImage: string, joinedAt: string }>,
 * }>}
 */
export async function getArtRun(sessionId) {
  const body = await apiFetch(`/api/art-runs/${sessionId}`);
  return body?.data;
}

/**
 * 협동 러닝 참가. (모집중 세션만)
 * @param {number} sessionId
 * @returns {Promise<void>}
 */
export async function joinArtRun(sessionId) {
  await apiFetch(`/api/art-runs/${sessionId}/participants`, { method: 'POST' });
}

/**
 * 협동 러닝 참가 취소. (호스트는 불가)
 * @param {number} sessionId
 * @returns {Promise<void>}
 */
export async function leaveArtRun(sessionId) {
  await apiFetch(`/api/art-runs/${sessionId}/participants/me`, { method: 'DELETE' });
}

/**
 * 협동 러닝 상태 변경. (호스트, IN_PROGRESS/COMPLETED)
 * @param {number} sessionId
 * @param {string} status
 * @returns {Promise<{ sessionId: number, status: string }>}
 */
export async function updateArtRunStatus(sessionId, status) {
  const body = await apiFetch(`/api/art-runs/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return body?.data;
}

/**
 * 협동 러닝 삭제. (호스트, 모집중만)
 * @param {number} sessionId
 * @returns {Promise<void>}
 */
export async function deleteArtRun(sessionId) {
  await apiFetch(`/api/art-runs/${sessionId}`, { method: 'DELETE' });
}
