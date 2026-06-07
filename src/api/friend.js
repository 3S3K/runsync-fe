import { apiFetch } from './http';

/**
 * 친구 목록 조회. (로그인 필요)
 * @returns {Promise<Array<{
 *   friendUserId: number,
 *   nickname: string,
 *   profileImage: string,
 *   activityStatus: string,
 *   lastActiveAt: string,
 * }>>}
 */
export async function getFriends() {
  const body = await apiFetch('/api/friends');
  return body?.data ?? [];
}
