import { apiClient, unwrapApiData } from './client';

export async function getMyInfo() {
  const response = await apiClient.get('/api/users/me');
  return unwrapApiData(response);
}

export async function getMySummary() {
  const response = await apiClient.get('/api/users/me/summary');
  return unwrapApiData(response);
}

export async function getMyRecords({ cursor, size } = {}) {
  const params = {};
  if (cursor != null) {
    params.cursor = cursor;
  }
  if (size != null) {
    params.size = size;
  }

  const response = await apiClient.get('/api/users/me/records', { params });
  return unwrapApiData(response);
}
