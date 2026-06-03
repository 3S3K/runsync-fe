import { useEffect, useState } from 'react';

import {
  getMockMypageData,
  mapMypageData,
} from '../utils/mypage-data';
import {
  fetchMypageUserApisOnce,
} from '../utils/fetch-mypage-user-apis';
import { clearCachedUserRecords } from '../utils/user-records-store';
import { normalizeAccessTokenForStorage } from '../utils/access-token-header';

function hasAccessTokenInStorage() {
  return Boolean(normalizeAccessTokenForStorage(
    localStorage.getItem('accessToken') || '',
  ));
}

function logUserApiSuccess(response) {
  console.log('User API success', response?.data ?? response);
}

function processApiResults(myInfoResult, summaryResult, recordsResult) {
  if (myInfoResult.status === 'rejected') {
    console.error('[useMypageData] GET /api/users/me failed', myInfoResult.reason);
  } else {
    logUserApiSuccess(myInfoResult.value);
  }

  if (summaryResult.status === 'rejected') {
    console.error('[useMypageData] GET /api/users/me/summary failed', summaryResult.reason);
  } else {
    logUserApiSuccess(summaryResult.value);
  }

  if (recordsResult.status === 'rejected') {
    console.error('[useMypageData] GET /api/users/me/records failed', recordsResult.reason);
  } else {
    logUserApiSuccess(recordsResult.value);
  }

  const summaryResponse = summaryResult.status === 'fulfilled'
    ? summaryResult.value
    : null;
  const recordsResponse = recordsResult.status === 'fulfilled'
    ? recordsResult.value
    : null;
  const myInfoResponse = myInfoResult.status === 'fulfilled'
    ? myInfoResult.value
    : null;

  return {
    summaryResponse,
    recordsResponse,
    myInfoResponse,
    hasAnyApiSuccess: Boolean(summaryResponse || recordsResponse || myInfoResponse),
  };
}

export function useMypageData() {
  const [data, setData] = useState(getMockMypageData());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const applyMockFallback = () => {
      clearCachedUserRecords();
      setData(getMockMypageData());
    };

    const loadMypageData = async () => {
      setIsLoading(true);

      if (!hasAccessTokenInStorage()) {
        console.log('accessToken 없음: 마이페이지 mock 데이터 사용');
        if (isMounted) {
          applyMockFallback();
          setIsLoading(false);
        }
        return;
      }

      try {
        const fetchPromise = fetchMypageUserApisOnce();

        if (!fetchPromise) {
          applyMockFallback();
          setIsLoading(false);
          return;
        }

        const {
          myInfoResult,
          summaryResult,
          recordsResult,
        } = await fetchPromise;

        if (!isMounted) return;

        const {
          summaryResponse,
          recordsResponse,
          myInfoResponse,
          hasAnyApiSuccess,
        } = processApiResults(myInfoResult, summaryResult, recordsResult);

        if (hasAnyApiSuccess) {
          setData(mapMypageData(
            summaryResponse ?? { data: {} },
            recordsResponse ?? { data: { records: [] } },
            myInfoResponse ?? { data: {} },
          ));
        } else {
          applyMockFallback();
        }
      } catch (error) {
        console.error('[useMypageData] loadMypageData failed', error);
        if (isMounted) {
          applyMockFallback();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMypageData();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    user: data.user,
    stats: data.stats,
    activities: data.activities,
    isLoading,
  };
}
