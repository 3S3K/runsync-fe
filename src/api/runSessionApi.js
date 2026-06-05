import { apiClient, unwrapApiData } from './client';
import { toSessionIdNumber } from '../utils/run-session-payloads';

export async function startRunSession({ startTime }) {
  const response = await apiClient.post('/api/run-sessions', { startTime });
  return unwrapApiData(response);
}

export async function finishRunSession(sessionId, payload) {
  const numericSessionId = toSessionIdNumber(sessionId);
  const response = await apiClient.patch(
    `/api/run-sessions/${numericSessionId}`,
    payload,
  );
  return unwrapApiData(response);
}

export async function saveRunRecordDetail(sessionId, payload) {
  const numericSessionId = toSessionIdNumber(sessionId);
  const response = await apiClient.patch(
    `/api/run-sessions/${numericSessionId}/records`,
    payload,
  );
  return unwrapApiData(response);
}

export async function updateRunLocation(sessionId, payload) {
  const numericSessionId = toSessionIdNumber(sessionId);
  const response = await apiClient.patch(
    `/api/run-sessions/${numericSessionId}/location`,
    payload,
  );
  return unwrapApiData(response);
}
