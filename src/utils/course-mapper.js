/** 순위별 경로 색 (1순위는 서비스 기본 주황) */
const COURSE_COLORS = ['#ff5a1f', '#2f80ed', '#27ae60'];

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

/**
 * 추천 API 응답의 코스를 화면에서 쓰는 형태로 바꾼다.
 * GeoJSON 좌표는 [경도, 위도] 순서라 지도용 { lat, lng } 로 뒤집는다.
 */
export function mapCourse(course) {
  const points = (course.geometry?.coordinates ?? []).map(([lng, lat]) => ({ lat, lng }));

  return {
    rank: course.rank,
    distanceKm: course.distanceKm,
    elevationGainM: Math.round(course.elevationGainM),
    predictedHrPct: Math.round(course.predictedHrPct),
    reason: course.reason,
    color: COURSE_COLORS[(course.rank - 1) % COURSE_COLORS.length],
    points,
    center: points.length > 0 ? getCenter(points) : null,
  };
}
