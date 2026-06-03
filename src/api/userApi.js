import axios from 'axios';

import { API_BASE_URL } from './config';
import { buildAuthorizationHeader } from '../utils/access-token-header';

const userApiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

userApiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  const authorization = buildAuthorizationHeader(accessToken || '');

  if (authorization) {
    config.headers.Authorization = authorization;
  }

  return config;
});

userApiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

/** GET /api/users/me — 내 기본 정보 */
export async function getMyInfo() {
  const { data } = await userApiClient.get('/api/users/me');
  return data;
}

/** GET /api/users/me/summary — 프로필 + 월간 통계 */
export async function getMySummary() {
  const { data } = await userApiClient.get('/api/users/me/summary');
  return data;
}

/** GET /api/users/me/records — 최근 러닝 기록 목록 */
export async function getMyRecords() {
  const { data } = await userApiClient.get('/api/users/me/records');
  return data;
}
