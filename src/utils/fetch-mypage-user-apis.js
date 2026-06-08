import {
  getMyInfo,
  getMyRecords,
  getMySummary,
} from '../api/userApi';
import { getAccessToken } from './tokens';

const CACHE_TTL_MS = 30_000;

let inflightPromise = null;
let inflightToken = '';
let cachedSuccessPromise = null;
let cachedToken = '';
let cachedAt = 0;

function getCacheKey() {
  return getAccessToken() || '';
}

function clearMypageUserApisCacheState() {
  inflightPromise = null;
  inflightToken = '';
  cachedSuccessPromise = null;
  cachedToken = '';
  cachedAt = 0;
}

function hasApiFailure({ myInfoResult, summaryResult, recordsResult }) {
  return [myInfoResult, summaryResult, recordsResult].some(
    (result) => result.status === 'rejected',
  );
}

function fetchMypageUserApis() {
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
    clearMypageUserApisCacheState();
    return null;
  }

  const now = Date.now();
  const isSuccessCacheValid = cachedSuccessPromise
    && cachedToken === token
    && now - cachedAt < CACHE_TTL_MS;

  if (isSuccessCacheValid) {
    return cachedSuccessPromise;
  }

  if (inflightPromise && inflightToken === token) {
    return inflightPromise;
  }

  inflightToken = token;
  inflightPromise = fetchMypageUserApis()
    .then((payload) => {
      if (hasApiFailure(payload)) {
        clearMypageUserApisCacheState();
        return payload;
      }

      cachedToken = token;
      cachedAt = now;
      cachedSuccessPromise = Promise.resolve(payload);

      return payload;
    })
    .catch((error) => {
      clearMypageUserApisCacheState();
      throw error;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
}

export function invalidateMypageUserApisCache() {
  clearMypageUserApisCacheState();
}
