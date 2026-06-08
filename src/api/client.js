import axios from 'axios';

import { API_BASE_URL } from './config';
import { requestTokenReissue } from './tokenReissue';
import { buildAuthorizationHeader } from '../utils/access-token-header';
import { canAttemptTokenReissue } from '../utils/access-token';
import { clearAuthSession, getAccessToken } from '../utils/tokens';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];

function processRefreshQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(token);
  });

  refreshQueue = [];
}

function isReissueRequest(url = '') {
  return url.includes('/api/auth/reissue');
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  const authorization = buildAuthorizationHeader(accessToken);

  if (authorization) {
    config.headers.Authorization = authorization;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !originalRequest
      || error.response?.status !== 401
      || originalRequest._retry
      || isReissueRequest(originalRequest.url)
    ) {
      console.error('[apiClient]', error);
      return Promise.reject(error);
    }

    if (!canAttemptTokenReissue()) {
      console.log('토큰 없음: mock 데이터 사용');
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest._retry = true;
        originalRequest.headers.Authorization = buildAuthorizationHeader(token);
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await requestTokenReissue();

      if (!newAccessToken) {
        throw error;
      }

      processRefreshQueue(null, newAccessToken);
      originalRequest.headers.Authorization = buildAuthorizationHeader(newAccessToken);
      return apiClient(originalRequest);
    } catch (reissueError) {
      processRefreshQueue(reissueError, null);
      clearAuthSession();
      console.error('[apiClient] token reissue failed', reissueError);
      return Promise.reject(reissueError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function unwrapApiData(response) {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }

  return response;
}

export function getApiErrorMessage(error, fallback = 'API request failed') {
  const responseData = error?.response?.data;

  if (responseData && typeof responseData === 'object' && responseData.message) {
    return responseData.message;
  }

  if (typeof responseData === 'string' && responseData) {
    return responseData;
  }

  return error?.message || fallback;
}
