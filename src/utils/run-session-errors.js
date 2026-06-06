const ACTIVE_SESSION_CONFLICT_MESSAGE = '이미 진행 중인 러닝 세션이 있습니다.';

export function getRunSessionErrorData(error) {
  const responseData = error?.response?.data;

  if (!responseData || typeof responseData !== 'object') {
    return null;
  }

  return responseData;
}

export function isActiveRunSessionConflict(error) {
  const responseData = getRunSessionErrorData(error);

  if (!responseData) {
    return false;
  }

  const message = String(responseData.message || '');

  return message.includes('이미 진행 중인 러닝 세션');
}

export function getActiveRunSessionConflictMessage(error) {
  return getRunSessionErrorData(error)?.message || ACTIVE_SESSION_CONFLICT_MESSAGE;
}

export const ACTIVE_RUN_SESSION_RETRY_MESSAGE = `${ACTIVE_SESSION_CONFLICT_MESSAGE} 종료 후 다시 시작해주세요.`;
