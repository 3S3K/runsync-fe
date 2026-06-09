import { useEffect, useState } from 'react';

import { getRunRecord } from '../api/run-record';
import { getRunningRecord } from '../data/runningRecord';
import { mapApiRecordToRunningRecord } from '../utils/running-record-mapper';
import { getCachedUserRecordById } from '../utils/user-records-store';
import { getAccessToken } from '../utils/tokens';

export function useRunningRecord(recordId) {
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadRecord = async () => {
      setIsLoading(true);

      // 1) 캐시(마이페이지 목록)에 있으면 통계부터 즉시 표시 (빠른 페인트, 경로는 아직 없음)
      const cachedRecord = getCachedUserRecordById(recordId);
      if (cachedRecord && isMounted) {
        setRecord(mapApiRecordToRunningRecord(cachedRecord));
        setIsLoading(false);
      }

      // 2) 비로그인: 상세 API 불가 → 캐시 없으면 mock
      if (!getAccessToken()) {
        if (!cachedRecord && isMounted) {
          setRecord(getRunningRecord(recordId));
          setIsLoading(false);
        }
        return;
      }

      // 3) 로그인: 상세 API 로 경로(paths) 포함 데이터를 받아 덮어쓴다
      try {
        const detail = await getRunRecord(recordId);
        if (isMounted && detail) {
          setRecord(mapApiRecordToRunningRecord(detail));
        }
      } catch (error) {
        console.error('[useRunningRecord]', error);
        if (isMounted && !cachedRecord) {
          setRecord(getRunningRecord(recordId));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRecord();

    return () => {
      isMounted = false;
    };
  }, [recordId]);

  return {
    record,
    isLoading,
  };
}
