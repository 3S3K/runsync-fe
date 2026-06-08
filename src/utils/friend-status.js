const STATUS_KEY = {
  RUNNING: 'running',
  OFFLINE: 'offline',
};

const STATUS_LABEL = {
  RUNNING: '러닝 중',
  OFFLINE: '오프라인',
};

/** API activityStatus(RUNNING/OFFLINE) → run-status 키(running/offline) */
export function toFriendStatus(activityStatus) {
  return STATUS_KEY[activityStatus] || 'offline';
}

/** API activityStatus → 한글 상태 라벨 */
export function getFriendStatusLabel(activityStatus) {
  return STATUS_LABEL[activityStatus] || '오프라인';
}
