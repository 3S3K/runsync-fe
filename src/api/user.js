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
 * 내 정보 수정. (닉네임 + 성별 + 생년월일이 모두 채워지면 백엔드가 USER 로 자동 승격)
 * @param {{ nickname?: string, gender?: 'MALE' | 'FEMALE', birthDate?: string, profileImage?: string }} payload
 *   birthDate: 'YYYY-MM-DD'
 * @returns {Promise<{ id: number, nickname: string, profileImage: string }>}
 */
export async function updateMyInfo(payload) {
  const body = await apiFetch('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
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
