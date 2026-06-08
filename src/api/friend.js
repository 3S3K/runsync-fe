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

/**
 * 친구 삭제. (로그인 필요)
 * @param {number} friendUserId
 * @returns {Promise<void>}
 */
export async function deleteFriend(friendUserId) {
  await apiFetch(`/api/friends/${friendUserId}`, { method: 'DELETE' });
}

/**
 * 친구 요청 보내기. (로그인 필요)
 * @param {number} receiverId 요청 받을 사용자 ID
 * @returns {Promise<{ requestId: number, status: string }>}
 */
export async function sendFriendRequest(receiverId) {
  const body = await apiFetch('/api/friends/requests', {
    method: 'POST',
    body: JSON.stringify({ receiverId }),
  });
  return body?.data;
}

/**
 * 받은 친구 요청 목록 조회. (로그인 필요)
 * @returns {Promise<Array<{
 *   requestId: number,
 *   senderId: number,
 *   senderNickname: string,
 *   status: string,
 *   createdAt: string,
 * }>>}
 */
export async function getReceivedRequests() {
  const body = await apiFetch('/api/friends/requests/received');
  return body?.data ?? [];
}

/**
 * 친구 요청 수락.
 * @param {number} requestId
 * @returns {Promise<void>}
 */
export async function acceptFriendRequest(requestId) {
  await apiFetch(`/api/friends/requests/${requestId}/accept`, { method: 'PATCH' });
}

/**
 * 친구 요청 거절.
 * @param {number} requestId
 * @returns {Promise<void>}
 */
export async function rejectFriendRequest(requestId) {
  await apiFetch(`/api/friends/requests/${requestId}/reject`, { method: 'PATCH' });
}
