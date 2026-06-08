import { apiFetch } from './http';

/**
 * 내 정보 조회. (로그인 필요)
 * @returns {Promise<{
 *   id: number,
 *   nickname: string,
 *   providerId: string,
 *   profileImage: string,
 *   role: string,
 *   birthDate: string,
 *   gender: string,
 * }>}
 */
export async function getMe() {
  const body = await apiFetch('/api/users/me');
  return body?.data;
}

/**
 * 닉네임으로 사용자 검색. (부분 일치, 커서 페이지네이션)
 * @param {string} nickname 검색어
 * @param {{ cursor?: number, size?: number }} [options]
 * @returns {Promise<{
 *   hasNext: boolean,
 *   nextCursor: number,
 *   users: Array<{ id: number, nickname: string, profileImage: string, relation: string }>,
 * }>}
 */
export async function searchUsers(nickname, { cursor, size } = {}) {
  const params = new URLSearchParams({ nickname });
  if (cursor != null) {
    params.set('cursor', cursor);
  }
  if (size != null) {
    params.set('size', size);
  }

  const body = await apiFetch(`/api/users/search?${params.toString()}`);
  return body?.data;
}
