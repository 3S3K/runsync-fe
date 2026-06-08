/**
 * API 친구 응답 → 친구 목록 UI 형식
 * @param {{
 *   friendUserId: number,
 *   nickname: string,
 *   profileImage: string,
 *   activityStatus: string,
 *   lastActiveAt?: string,
 * }} friend
 */
export function mapApiFriendToListItem(friend) {
  const statusInfo = mapActivityStatus(
    friend.activityStatus,
    friend.lastActiveAt,
  );

  return {
    id: String(friend.friendUserId),
    name: friend.nickname,
    handle: `@user${friend.friendUserId}`,
    status: statusInfo.status,
    statusLabel: statusInfo.statusLabel,
    avatarSrc: friend.profileImage || undefined,
  };
}

function mapActivityStatus(activityStatus, lastActiveAt) {
  const normalized = (activityStatus || '').toUpperCase();

  if (normalized === 'RUNNING') {
    return { status: 'running', statusLabel: '현재 러닝 중' };
  }

  if (normalized === 'OFFLINE') {
    return { status: 'offline', statusLabel: '오프라인' };
  }

  if (lastActiveAt) {
    return {
      status: 'recent',
      statusLabel: formatLastActiveLabel(lastActiveAt),
    };
  }

  return { status: 'recent', statusLabel: '5분 전 활동' };
}

function formatLastActiveLabel(lastActiveAt) {
  const activeAt = new Date(lastActiveAt);
  if (Number.isNaN(activeAt.getTime())) {
    return '최근 활동';
  }

  const diffMinutes = Math.floor((Date.now() - activeAt.getTime()) / 60000);
  if (diffMinutes < 1) {
    return '방금 활동';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전 활동`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전 활동`;
  }

  return '오프라인';
}
