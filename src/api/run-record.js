import { apiClient, unwrapApiData } from './client';

/**
 * 러닝 기록 상세 조회. 통계와 함께 GPS 경로(paths)를 포함한다.
 * @param {number|string} recordId 기록 ID
 * @returns {Promise<object>} RunRecordRes (paths 포함)
 */
export async function getRunRecord(recordId) {
  const response = await apiClient.get(`/api/run-records/${recordId}`);
  return unwrapApiData(response);
}
