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
