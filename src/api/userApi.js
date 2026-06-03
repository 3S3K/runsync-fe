import { apiClient, unwrapApiData } from './client';

export async function getMyInfo() {
  const response = await apiClient.get('/api/users/me');
  return unwrapApiData(response);
}

export async function getMySummary() {
  const response = await apiClient.get('/api/users/me/summary');
  return unwrapApiData(response);
}

export async function getMyRecords() {
  const response = await apiClient.get('/api/users/me/records');
  return unwrapApiData(response);
}
