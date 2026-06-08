import { useEffect, useState } from 'react';

import {
  getEmptyMypageData,
  getMockMypageData,
  mapMypageData,
} from '../utils/mypage-data';
import {
  fetchMypageUserApisOnce,
} from '../utils/fetch-mypage-user-apis';
import { clearCachedUserRecords } from '../utils/user-records-store';
import { getAccessToken } from '../utils/tokens';

function hasAccessTokenInStorage() {
  return Boolean(getAccessToken());
}

function processApiResults(myInfoResult, summaryResult, recordsResult) {
  if (myInfoResult.status === 'rejected') {
    console.error('[useMypageData] GET /api/users/me failed', myInfoResult.reason);
  }

  if (summaryResult.status === 'rejected') {
    console.error('[useMypageData] GET /api/users/me/summary failed', summaryResult.reason);
  }

  if (recordsResult.status === 'rejected') {
    console.error('[useMypageData] GET /api/users/me/records failed', recordsResult.reason);
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

  const myInfoLoadedFromApi = myInfoResult.status === 'fulfilled';
  const summaryLoadedFromApi = summaryResult.status === 'fulfilled';
  const recordsLoadedFromApi = recordsResult.status === 'fulfilled';
  const allApisSucceeded = myInfoLoadedFromApi
    && summaryLoadedFromApi
    && recordsLoadedFromApi;

  return {
    summaryResponse,
    recordsResponse,
    myInfoResponse,
    myInfoLoadedFromApi,
    summaryLoadedFromApi,
    recordsLoadedFromApi,
    allApisSucceeded,
    hasAnyApiSuccess: Boolean(summaryResponse || recordsResponse || myInfoResponse),
  };
}

export function useMypageData() {
  const [data, setData] = useState(getEmptyMypageData());
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const applyMockFallback = () => {
      clearCachedUserRecords();
      setData(getMockMypageData());
      setIsUsingMockData(true);
    };

    const applyEmptyFallback = () => {
      clearCachedUserRecords();
      setData(getEmptyMypageData());
      setIsUsingMockData(false);
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
          applyEmptyFallback();
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
          myInfoLoadedFromApi,
          summaryLoadedFromApi,
          recordsLoadedFromApi,
          allApisSucceeded,
          hasAnyApiSuccess,
        } = processApiResults(myInfoResult, summaryResult, recordsResult);

        if (allApisSucceeded) {
          setData(mapMypageData(
            summaryResponse,
            recordsResponse,
            myInfoResponse,
            {
              myInfoLoadedFromApi,
              summaryLoadedFromApi,
              recordsLoadedFromApi,
            },
          ));
          setIsUsingMockData(false);
        } else if (hasAnyApiSuccess) {
          setData(mapMypageData(
            summaryResponse ?? { data: {} },
            recordsResponse ?? { data: { records: [] } },
            myInfoResponse ?? { data: {} },
            {
              myInfoLoadedFromApi,
              summaryLoadedFromApi,
              recordsLoadedFromApi,
              useMockFallback: false,
            },
          ));
          setIsUsingMockData(false);
        } else {
          applyEmptyFallback();
        }
      } catch (error) {
        console.error('[useMypageData] loadMypageData failed', error);
        if (isMounted) {
          applyEmptyFallback();
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
    isUsingMockData,
  };
}
