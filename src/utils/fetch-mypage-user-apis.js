import {
  getMyInfo,
  getMyRecords,
  getMySummary,
} from '../api/userApi';
import { getAccessToken } from './tokens';

const CACHE_TTL_MS = 30_000;

let cachedPromise = null;
let cachedToken = '';
let cachedAt = 0;

function getCacheKey() {
  return getAccessToken() || '';
}

function createFetchPromise() {
  return Promise.allSettled([
    getMyInfo(),
    getMySummary(),
    getMyRecords(),
  ]).then(([myInfoResult, summaryResult, recordsResult]) => ({
    myInfoResult,
    summaryResult,
    recordsResult,
  }));
}

export function fetchMypageUserApisOnce() {
  const token = getCacheKey();

  if (!token) {
    cachedPromise = null;
    cachedToken = '';
    cachedAt = 0;
    return null;
  }

  const now = Date.now();
  const isCacheValid = cachedPromise
    && cachedToken === token
    && now - cachedAt < CACHE_TTL_MS;

  if (isCacheValid) {
    return cachedPromise;
  }

  cachedToken = token;
  cachedAt = now;
  cachedPromise = createFetchPromise();

  return cachedPromise;
}

export function invalidateMypageUserApisCache() {
  cachedPromise = null;
  cachedToken = '';
  cachedAt = 0;
}
