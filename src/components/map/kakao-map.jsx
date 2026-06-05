import { useEffect, useRef } from 'react';

import { useKakaoLoader } from '../../hooks/use-kakao-loader';

import styles from './kakao-map.module.css';

/**
 * props 로 받은 좌표에 카카오 지도를 그리는 범용 컴포넌트.
 * @param {{ lat: number, lng: number }} center 지도 중심 좌표
 * @param {number} [level] 확대 레벨 (작을수록 확대)
 * @param {Array<{ id: string|number, lat: number, lng: number, title?: string }>} [markers] 마커 목록
 * @param {string} [className] 부모에서 크기/위치 제어용 클래스
 */
export default function KakaoMap({
  center,
  level = 4,
  markers = [],
  className = '',
}) {
  const sdkStatus = useKakaoLoader();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerObjectsRef = useRef([]);

  // SDK 준비되면 지도 1회 생성
  useEffect(() => {
    if (sdkStatus !== 'ready' || !containerRef.current || mapRef.current) {
      return;
    }

    const { kakao } = window;
    mapRef.current = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level,
    });
  }, [sdkStatus, center, level]);

  // center 변경 시 중심 이동
  useEffect(() => {
    if (!mapRef.current || !center) {
      return;
    }

    const { kakao } = window;
    mapRef.current.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
  }, [center]);

  // markers 변경 시 다시 그림
  useEffect(() => {
    if (sdkStatus !== 'ready' || !mapRef.current) {
      return;
    }

    const { kakao } = window;
    markerObjectsRef.current.forEach((marker) => marker.setMap(null));
    markerObjectsRef.current = markers.map((marker) => {
      const kakaoMarker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(marker.lat, marker.lng),
        title: marker.title,
      });
      kakaoMarker.setMap(mapRef.current);
      return kakaoMarker;
    });
  }, [sdkStatus, markers]);

  if (sdkStatus === 'error') {
    return (
      <div className={`${styles.fallback} ${className}`}>
        지도를 불러오지 못했어요.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.map} ${className}`}
    />
  );
}
