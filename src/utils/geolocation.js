/** 위치 권한 거부/실패 시 사용할 기본 중심 좌표 (서울시청) */
export const DEFAULT_CENTER = { lat: 37.5666805, lng: 126.9784147 };

/** Geolocation API 옵션 */
export const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

/** GeolocationPositionError.code 에 대응하는 사용자 안내 메시지 */
export function getGeolocationErrorMessage(error) {
  switch (error?.code) {
    case 1: // PERMISSION_DENIED
      return '위치 권한이 거부되었어요. 브라우저 설정에서 위치 접근을 허용해 주세요.';
    case 2: // POSITION_UNAVAILABLE
      return '현재 위치를 확인할 수 없어요. 잠시 후 다시 시도해 주세요.';
    case 3: // TIMEOUT
      return '위치 확인이 지연되고 있어요. 다시 시도해 주세요.';
    default:
      return '위치를 가져오지 못했어요.';
  }
}
