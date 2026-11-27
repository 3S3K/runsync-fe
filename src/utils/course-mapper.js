import { SLOPE_GRADES, getSlopeGrade } from './course-format';

/** 경사 구간 정보가 없을 때 쓰는 경로 색 (서비스 기본 주황) */
const FALLBACK_PATH_COLOR = '#ff5a1f';
const EARTH_RADIUS_M = 6371000;

/** 코스 거리에 맞는 카카오맵 확대 레벨 (숫자가 클수록 넓게 보인다) */
export function getMapLevel(distanceKm) {
  if (distanceKm <= 3) {
    return 5;
  }
  if (distanceKm <= 7) {
    return 6;
  }
  if (distanceKm <= 12) {
    return 7;
  }
  return 8;
}

/** 경로 전체가 화면에 들어오도록 좌표 범위의 가운데를 구한다 */
function getCenter(points) {
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);

  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
}

/** GeoJSON 좌표는 [경도, 위도] 순서라 지도용 { lat, lng } 로 뒤집는다 */
function toPoints(coordinates) {
  return (coordinates ?? []).map(([lng, lat]) => ({ lat, lng }));
}

function getDistanceM(from, to) {
  const toRad = (degree) => (degree * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

/** 경로의 각 점까지 누적 거리(m) */
function getCumulativeDistances(points) {
  const distances = [0];
  for (let i = 1; i < points.length; i += 1) {
    distances.push(distances[i - 1] + getDistanceM(points[i - 1], points[i]));
  }
  return distances;
}

/** 경로를 따라 출발점에서 targetM 만큼 간 지점의 좌표 */
function getPointAlong(points, cumulative, targetM) {
  if (points.length === 0) {
    return null;
  }
  const index = cumulative.findIndex((distance) => distance >= targetM);
  if (index <= 0) {
    return index === 0 ? points[0] : points[points.length - 1];
  }
  const span = cumulative[index] - cumulative[index - 1];
  const ratio = span > 0 ? (targetM - cumulative[index - 1]) / span : 0;
  const from = points[index - 1];
  const to = points[index];
  return {
    lat: from.lat + (to.lat - from.lat) * ratio,
    lng: from.lng + (to.lng - from.lng) * ratio,
  };
}

/**
 * 고도 프로필의 각 지점에 경사와 지도 좌표를 붙인다.
 * 경사는 앞뒤 지점의 고도 차로 구한 값이라 지도의 구간 색(도로 단위)과 조금 다를 수 있다.
 */
function mapProfile(elevationProfile, points) {
  const profile = elevationProfile ?? [];
  if (profile.length < 2) {
    return [];
  }

  const cumulative = getCumulativeDistances(points);
  const routeLengthM = cumulative[cumulative.length - 1] ?? 0;
  const profileLengthM = profile[profile.length - 1].distanceM;

  return profile.map((point, index) => {
    const before = profile[Math.max(index - 1, 0)];
    const after = profile[Math.min(index + 1, profile.length - 1)];
    const run = after.distanceM - before.distanceM;
    const slopePct = run > 0 ? ((after.elevationM - before.elevationM) / run) * 100 : 0;
    // 프로필의 거리와 지도 경로의 길이가 조금 달라도 같은 비율의 지점을 가리키게 한다
    const alongM = profileLengthM > 0 ? (point.distanceM / profileLengthM) * routeLengthM : 0;

    return {
      distanceM: point.distanceM,
      elevationM: point.elevationM,
      slopePct,
      grade: getSlopeGrade(slopePct),
      position: getPointAlong(points, cumulative, alongM),
    };
  });
}

/** 지도에 그릴 선 목록. 어두운 테두리 선 위에 경사 등급별 색 선을 올린다 */
function mapPaths(course, points) {
  const key = `course-${course.rank}`;
  const outline = { id: `${key}-outline`, points, color: '#1f2a44', weight: 9 };
  const segments = course.slopeSegments ?? [];

  if (segments.length === 0) {
    return [outline, { id: `${key}-line`, points, color: FALLBACK_PATH_COLOR, weight: 5 }];
  }

  return [
    outline,
    // 지도 컴포넌트는 같은 id 의 선 색을 바꾸지 않으므로 id 에 등급을 넣는다
    ...segments.map((segment, index) => ({
      id: `${key}-${index}-${segment.grade}`,
      points: toPoints(segment.coordinates),
      color: SLOPE_GRADES[segment.grade]?.color ?? FALLBACK_PATH_COLOR,
      weight: 5,
    })),
  ];
}

/** 추천 API 응답의 코스를 화면에서 쓰는 형태로 바꾼다. */
export function mapCourse(course) {
  const points = toPoints(course.geometry?.coordinates);

  return {
    rank: course.rank,
    name: course.name || `${course.rank}순위 코스`,
    score: course.score ?? null,
    distanceKm: course.distanceKm,
    elevationGainM: Math.round(course.elevationGainM),
    maxSlopePct: course.maxSlopePct,
    predictedHrPct: Math.round(course.predictedHrPct),
    estimatedTimeMin: course.estimatedTimeMin ?? null,
    stairsCount: course.stairsCount ?? null,
    hrZone: course.hrZone ?? null,
    hrBpmRange: course.hrBpmRange ?? null,
    biggestClimb: course.biggestClimb ?? null,
    reason: course.reason,
    points,
    center: points.length > 0 ? getCenter(points) : null,
    paths: mapPaths(course, points),
    hasSlopeSegments: (course.slopeSegments ?? []).length > 0,
    profile: mapProfile(course.elevationProfile, points),
  };
}
