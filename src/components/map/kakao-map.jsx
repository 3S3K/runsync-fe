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
  }, [sdkStatus, center.lat, center.lng, level]);

  // center 변경 시 중심 이동
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const { kakao } = window;
    mapRef.current.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
  }, [center.lat, center.lng]);

  // level 변경 시 확대 레벨 갱신
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.setLevel(level);
  }, [level]);

  // markers 변경/언마운트 시 마커 그리고 정리
  useEffect(() => {
    if (sdkStatus !== 'ready' || !mapRef.current) {
      return undefined;
    }

    const { kakao } = window;
    const created = markers.map((marker) => {
      const kakaoMarker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(marker.lat, marker.lng),
        title: marker.title,
      });
      kakaoMarker.setMap(mapRef.current);
      return kakaoMarker;
    });

    return () => created.forEach((marker) => marker.setMap(null));
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
