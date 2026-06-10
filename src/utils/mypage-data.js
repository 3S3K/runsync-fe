import { currentUser } from '../data/friends';
import { profileStats, recentActivities } from '../data/profile';
import {
  formatAveragePace,
  formatDurationHms,
  formatKoreanDateTime,
  formatPaceFromDistanceAndDuration,
} from './record-formatters';
import { setCachedUserRecords, clearCachedUserRecords } from './user-records-store';

const TOTAL_TIME_PLACEHOLDER = '--:--:--';

export const DEFAULT_PROFILE_AVATAR_SRC = currentUser.avatarSrc;
export const MYPAGE_TOTAL_TIME_DISPLAY = TOTAL_TIME_PLACEHOLDER;

export function getEmptyMypageData() {
  return {
    user: {
      name: '',
      handle: '',
      avatarSrc: DEFAULT_PROFILE_AVATAR_SRC,
      status: '',
      statusLabel: '',
    },
    stats: {
      totalDistanceKm: 0,
      totalTime: TOTAL_TIME_PLACEHOLDER,
      totalRuns: 0,
      monthlyGoalKm: 50,
      averagePaceLabel: '-',
    },
    activities: [],
  };
}

export function getMockMypageData() {
  return {
    user: {
      name: currentUser.name,
      handle: currentUser.handle,
      avatarSrc: currentUser.avatarSrc,
      status: currentUser.status,
      statusLabel: currentUser.statusLabel,
    },
    stats: {
      totalDistanceKm: profileStats.totalDistanceKm,
      totalTime: profileStats.totalTime,
      totalRuns: profileStats.totalRuns,
      monthlyGoalKm: profileStats.monthlyGoalKm,
      averagePaceLabel: profileStats.averagePaceLabel,
    },
    activities: recentActivities.map((activity) => ({ ...activity })),
  };
}

export function mapMypageData(
  summaryResponse,
  recordsResponse,
  myInfoResponse,
  {
    recordsLoadedFromApi = false,
    summaryLoadedFromApi = false,
    myInfoLoadedFromApi = false,
    useMockFallback = false,
  } = {},
) {
  const summary = summaryResponse?.data ?? {};
  const recordsPayload = recordsResponse?.data ?? {};
  const myInfo = myInfoResponse?.data ?? {};
  const records = recordsPayload.records ?? [];
  const fallback = useMockFallback ? getMockMypageData() : getEmptyMypageData();
  const monthlyStats = summary.monthlyStats ?? {};
  const providerId = myInfo.providerId ?? myInfo.provider_id;

  if (records.length > 0) {
    setCachedUserRecords(records);
  } else if (recordsLoadedFromApi) {
    clearCachedUserRecords();
  }

  return {
    user: {
      name: myInfo.nickname || summary.nickname || fallback.user.name,
      handle: providerId ? `@${providerId}` : fallback.user.handle,
      avatarSrc: summary.profileImage
        || myInfo.profileImage
        || myInfo.profile_image
        || fallback.user.avatarSrc,
      status: useMockFallback ? fallback.user.status : '',
      statusLabel: useMockFallback ? fallback.user.statusLabel : '',
    },
    stats: {
      totalDistanceKm: summaryLoadedFromApi
        ? (monthlyStats.totalDistance ?? 0)
        : fallback.stats.totalDistanceKm,
      totalTime: TOTAL_TIME_PLACEHOLDER,
      totalRuns: summaryLoadedFromApi
        ? (monthlyStats.totalRunCount ?? 0)
        : fallback.stats.totalRuns,
      monthlyGoalKm: summaryLoadedFromApi
        ? (monthlyStats.monthlyGoalKm ?? fallback.stats.monthlyGoalKm)
        : fallback.stats.monthlyGoalKm,
      averagePaceLabel: summaryLoadedFromApi
        ? formatAveragePace(monthlyStats.averagePace)
        : fallback.stats.averagePaceLabel,
    },
    activities: mapMypageActivities(
      records,
      fallback.activities,
      recordsLoadedFromApi,
      useMockFallback,
    ),
  };
}

export function mapMypageActivities(
  records,
  fallbackActivities,
  recordsLoadedFromApi,
  useMockFallback,
) {
  if (!Array.isArray(records) || records.length === 0) {
    if (recordsLoadedFromApi) {
      return [];
    }

    return useMockFallback ? fallbackActivities : [];
  }

  return records.map((record, index) => {
    const recordId = String(record.recordId ?? `activity-${index + 1}`);

    return {
      id: recordId,
      recordId,
      dateLabel: formatKoreanDateTime(record.startTime)
        || fallbackActivities[index]?.dateLabel
        || '',
      distanceKm: Number(record.distance ?? 0),
      duration: formatDurationHms(record.durationSeconds),
      durationSeconds: Number(record.durationSeconds ?? 0),
      paceLabel: formatPaceFromDistanceAndDuration(
        record.distance,
        record.durationSeconds,
      ),
    };
  });
}
