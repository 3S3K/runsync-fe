import { useEffect, useRef } from 'react';

import { useKakaoLoader } from '../../hooks/use-kakao-loader';

import defaultAvatar from '../../assets/runner-man.png';
import styles from './kakao-map.module.css';

const MARKER_RING_COLOR = {
  me: '#45b85a',
  RUNNING: '#4caf50',
  OFFLINE: '#9e9e9e',
};

function getRingColor(marker) {
  if (marker.id === 'me') {
    return MARKER_RING_COLOR.me;
  }

  return MARKER_RING_COLOR[marker.status] || MARKER_RING_COLOR.OFFLINE;
}

// CustomOverlay 에 들어갈 원형 아바타 DOM (CSS 모듈이 안 먹어 인라인 스타일 사용)
function createMarkerElement(marker) {
  const wrapper = document.createElement('div');
  wrapper.title = marker.title || '';
  wrapper.style.cssText = [
    'width:44px',
    'height:44px',
    'border-radius:50%',
    `border:3px solid ${getRingColor(marker)}`,
    'background:#fff',
    'box-shadow:0 2px 8px rgba(0,0,0,0.25)',
    'overflow:hidden',
  ].join(';');

  const img = document.createElement('img');
  img.src = marker.profileImage || defaultAvatar;
  img.alt = marker.title || '';
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
  img.onerror = () => {
    img.onerror = null;
    img.src = defaultAvatar;
  };

  wrapper.appendChild(img);
  return wrapper;
}

// 도안 waypoint 등 단순 점 마커 DOM
function createDotElement() {
  const dot = document.createElement('div');
  dot.style.cssText = [
    'width:12px',
    'height:12px',
    'border-radius:50%',
    'background:#ff5a1f',
    'border:2px solid #fff',
    'box-shadow:0 1px 3px rgba(0,0,0,0.3)',
  ].join(';');
  return dot;
}

/**
 * props 로 받은 좌표에 카카오 지도를 그리는 범용 컴포넌트.
 * @param {{ lat: number, lng: number }} center 지도 중심 좌표
 * @param {number} [level] 확대 레벨 (작을수록 확대)
 * @param {number} [recenterKey] 값이 바뀔 때마다 center 로 강제 재중심 (좌표가 같아도)
 * @param {Array<{ id: string|number, lat: number, lng: number, title?: string }>} [markers] 마커 목록
 * @param {string} [className] 부모에서 크기/위치 제어용 클래스
 */
export default function KakaoMap({
  center,
  level = 4,
  recenterKey = 0,
  markers = [],
  paths = [],
  dotMarkers = [],
  onMapClick,
  className = '',
}) {
  const sdkStatus = useKakaoLoader();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const overlaysRef = useRef(new Map());
  const polylinesRef = useRef(new Map());
  const dotOverlaysRef = useRef(new Map());
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;
  const centerRef = useRef(center);
  centerRef.current = center;

  // SDK 준비되면 지도 1회 생성
  useEffect(() => {
    if (sdkStatus !== 'ready' || !containerRef.current || mapRef.current) {
      return;
    }

    const { kakao } = window;
    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level,
    });
    mapRef.current = map;

    kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      onMapClickRef.current?.({ lat: latlng.getLat(), lng: latlng.getLng() });
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

  // recenterKey 가 바뀌면(예: "내 위치" 재클릭) 좌표가 직전과 같아도 강제로 재중심
  useEffect(() => {
    if (!mapRef.current || recenterKey === 0) {
      return;
    }

    const { kakao } = window;
    const { lat, lng } = centerRef.current;
    mapRef.current.setCenter(new kakao.maps.LatLng(lat, lng));
  }, [recenterKey]);

  // markers 변경 시 id 기준으로 갱신 (전체 재생성 방지 → 깜빡임/성능 개선)
  useEffect(() => {
    if (sdkStatus !== 'ready' || !mapRef.current) {
      return;
    }

    const { kakao } = window;
    const overlays = overlaysRef.current;
    const seen = new Set();

    markers.forEach((marker) => {
      seen.add(marker.id);
      const position = new kakao.maps.LatLng(marker.lat, marker.lng);
      const existing = overlays.get(marker.id);

      if (existing) {
        existing.overlay.setPosition(position);
        // 상태/프로필/이름이 바뀐 경우에만 내용 교체
        if (
          existing.data.status !== marker.status ||
          existing.data.profileImage !== marker.profileImage ||
          existing.data.title !== marker.title
        ) {
          existing.overlay.setContent(createMarkerElement(marker));
        }
        existing.data = marker;
      } else {
        const overlay = new kakao.maps.CustomOverlay({
          position,
          content: createMarkerElement(marker),
          xAnchor: 0.5,
          yAnchor: 0.5,
        });
        overlay.setMap(mapRef.current);
        overlays.set(marker.id, { overlay, data: marker });
      }
    });

    // 더 이상 없는 마커 제거
    overlays.forEach((value, id) => {
      if (!seen.has(id)) {
        value.overlay.setMap(null);
        overlays.delete(id);
      }
    });
  }, [sdkStatus, markers]);

  // paths(폴리라인) 변경 시 id 기준 갱신
  useEffect(() => {
    if (sdkStatus !== 'ready' || !mapRef.current) {
      return;
    }

    const { kakao } = window;
    const polylines = polylinesRef.current;
    const seen = new Set();

    paths.forEach((path) => {
      seen.add(path.id);
      const latLngs = (path.points || []).map(
        (point) => new kakao.maps.LatLng(point.lat, point.lng),
      );
      const existing = polylines.get(path.id);

      if (existing) {
        existing.setPath(latLngs);
      } else {
        const polyline = new kakao.maps.Polyline({
          path: latLngs,
          strokeWeight: 4,
          strokeColor: path.color || '#ff5a1f',
          strokeOpacity: 0.9,
          strokeStyle: path.dashed ? 'shortdash' : 'solid',
        });
        polyline.setMap(mapRef.current);
        polylines.set(path.id, polyline);
      }
    });

    polylines.forEach((polyline, id) => {
      if (!seen.has(id)) {
        polyline.setMap(null);
        polylines.delete(id);
      }
    });
  }, [sdkStatus, paths]);

  // dotMarkers(단순 점) 변경 시 id 기준 갱신
  useEffect(() => {
    if (sdkStatus !== 'ready' || !mapRef.current) {
      return;
    }

    const { kakao } = window;
    const dots = dotOverlaysRef.current;
    const seen = new Set();

    dotMarkers.forEach((dot) => {
      seen.add(dot.id);
      const position = new kakao.maps.LatLng(dot.lat, dot.lng);
      const existing = dots.get(dot.id);

      if (existing) {
        existing.setPosition(position);
      } else {
        const overlay = new kakao.maps.CustomOverlay({
          position,
          content: createDotElement(),
          xAnchor: 0.5,
          yAnchor: 0.5,
        });
        overlay.setMap(mapRef.current);
        dots.set(dot.id, overlay);
      }
    });

    dots.forEach((overlay, id) => {
      if (!seen.has(id)) {
        overlay.setMap(null);
        dots.delete(id);
      }
    });
  }, [sdkStatus, dotMarkers]);

  // 언마운트 시 오버레이/폴리라인/점 전부 정리
  useEffect(
    () => () => {
      overlaysRef.current.forEach((value) => value.overlay.setMap(null));
      overlaysRef.current.clear();
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      polylinesRef.current.clear();
      dotOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
      dotOverlaysRef.current.clear();
    },
    [],
  );

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
