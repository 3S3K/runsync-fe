import { useEffect, useState } from 'react';

import { getMyRecords } from '../api/userApi';
import { getRunningRecord } from '../data/runningRecord';
import { mapApiRecordToRunningRecord } from '../utils/running-record-mapper';
import {
  getCachedUserRecordById,
  setCachedUserRecords,
} from '../utils/user-records-store';
import { getAccessToken } from '../utils/tokens';

export function useRunningRecord(recordId) {
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadRecord = async () => {
      setIsLoading(true);

      const cachedRecord = getCachedUserRecordById(recordId);
      if (cachedRecord) {
        if (isMounted) {
          setRecord(mapApiRecordToRunningRecord(cachedRecord));
          setIsLoading(false);
        }
        return;
      }

      const mockRecord = getRunningRecord(recordId);
      if (!getAccessToken()) {
        if (isMounted) {
          setRecord(mockRecord);
          setIsLoading(false);
        }
        return;
      }

      try {
        const recordsResponse = await getMyRecords();
        const records = recordsResponse?.data?.records ?? [];

        if (records.length > 0) {
          setCachedUserRecords(records);
        }

        const apiRecord = records.find(
          (item) => String(item.recordId) === String(recordId),
        );

        if (isMounted) {
          setRecord(
            apiRecord
              ? mapApiRecordToRunningRecord(apiRecord)
              : mockRecord,
          );
        }
      } catch (error) {
        console.error('[useRunningRecord]', error);
        if (isMounted) {
          setRecord(mockRecord);
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
