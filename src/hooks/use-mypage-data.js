import { useCallback, useEffect, useState } from 'react';

import { getMyRecords } from '../api/userApi';
import {
  getEmptyMypageData,
  getMockMypageData,
  mapMypageActivities,
  mapMypageData,
} from '../utils/mypage-data';
import {
  fetchMypageUserApisOnce,
} from '../utils/fetch-mypage-user-apis';
import {
  clearCachedUserRecords,
  getCachedUserRecords,
  setCachedUserRecords,
} from '../utils/user-records-store';
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
  // 활동(러닝 기록) 무한 스크롤용 커서 상태
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

        // 첫 페이지의 커서로 무한 스크롤 시작점 설정 (커서가 있을 때만 더 로드)
        if (recordsLoadedFromApi) {
          const cursor = recordsResponse?.data?.nextCursor ?? null;
          setNextCursor(cursor);
          setHasMore(Boolean(recordsResponse?.data?.hasNext) && cursor != null);
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

  // 다음 페이지 활동을 받아 기존 목록에 이어 붙인다 (무한 스크롤)
  const loadMoreActivities = useCallback(async () => {
    if (isLoadingMore || !hasMore || nextCursor == null) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const page = await getMyRecords({ cursor: nextCursor });
      const payload = page?.data ?? {};
      const newRecords = payload.records ?? [];
      const newActivities = mapMypageActivities(newRecords, [], true, false);

      // 상세 페이지 즉시 표시용 전역 캐시에도 이어 붙인다
      if (newRecords.length > 0) {
        setCachedUserRecords([...getCachedUserRecords(), ...newRecords]);
      }

      setData((prev) => ({
        ...prev,
        activities: [...prev.activities, ...newActivities],
      }));
      const cursor = payload.nextCursor ?? null;
      setNextCursor(cursor);
      setHasMore(Boolean(payload.hasNext) && cursor != null);
    } catch (error) {
      console.error('[useMypageData] loadMoreActivities failed', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, nextCursor]);

  return {
    user: data.user,
    stats: data.stats,
    activities: data.activities,
    isLoading,
    isUsingMockData,
    hasMore,
    isLoadingMore,
    loadMoreActivities,
  };
}
