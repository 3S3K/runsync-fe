import { currentUser } from '../data/friends';
import { profileStats, recentActivities } from '../data/profile';
import {
  formatDurationHms,
  formatKoreanDateTime,
} from './record-formatters';
import { setCachedUserRecords, clearCachedUserRecords } from './user-records-store';

const TOTAL_TIME_PLACEHOLDER = '--:--:--';

export const DEFAULT_PROFILE_AVATAR_SRC = currentUser.avatarSrc;
export const MYPAGE_TOTAL_TIME_DISPLAY = TOTAL_TIME_PLACEHOLDER;

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
    },
    activities: recentActivities.map((activity) => ({ ...activity })),
  };
}

export function mapMypageData(
  summaryResponse,
  recordsResponse,
  myInfoResponse,
  { recordsLoadedFromApi = false } = {},
) {
  const summary = summaryResponse?.data ?? {};
  const recordsPayload = recordsResponse?.data ?? {};
  const myInfo = myInfoResponse?.data ?? {};
  const records = recordsPayload.records ?? [];
  const mock = getMockMypageData();
  const monthlyStats = summary.monthlyStats ?? {};
  const providerId = myInfo.providerId ?? myInfo.provider_id;

  if (records.length > 0) {
    setCachedUserRecords(records);
  } else if (recordsLoadedFromApi) {
    clearCachedUserRecords();
  }

  return {
    user: {
      name: myInfo.nickname || summary.nickname || mock.user.name,
      handle: providerId ? `@${providerId}` : mock.user.handle,
      avatarSrc: summary.profileImage
        || myInfo.profileImage
        || myInfo.profile_image
        || mock.user.avatarSrc,
      status: mock.user.status,
      statusLabel: mock.user.statusLabel,
    },
    stats: {
      totalDistanceKm: monthlyStats.totalDistance ?? mock.stats.totalDistanceKm,
      totalTime: TOTAL_TIME_PLACEHOLDER,
      totalRuns: monthlyStats.totalRunCount ?? mock.stats.totalRuns,
    },
    activities: mapMypageActivities(records, mock.activities, recordsLoadedFromApi),
  };
}

function mapMypageActivities(records, mockActivities, recordsLoadedFromApi) {
  if (!Array.isArray(records) || records.length === 0) {
    return recordsLoadedFromApi ? [] : mockActivities;
  }

  return records.map((record, index) => {
    const recordId = String(record.recordId ?? `activity-${index + 1}`);

    return {
      id: recordId,
      recordId,
      dateLabel: formatKoreanDateTime(record.startTime)
        || mockActivities[index]?.dateLabel
        || '',
      distanceKm: Number(record.distance ?? 0),
      duration: formatDurationHms(record.durationSeconds),
    };
  });
}
