import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import KakaoMap from '../../components/map/kakao-map';
import { useArtRun } from '../../hooks/use-art-run';
import { useArtRunRealtime } from '../../hooks/use-art-run-realtime';
import { useGeoWatch } from '../../hooks/use-geo-watch';
import { DEFAULT_CENTER } from '../../utils/geolocation';

import styles from './art-run-run-page.module.css';

const DESIGN_COLOR = '#9e9e9e';

export default function ArtRunRunPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { artRun, me, status } = useArtRun(id);
  const [mapCenter, setMapCenter] = useState(null);
  const [recenterKey, setRecenterKey] = useState(0);

  const myUserId = me?.id ?? null;
  const runStatus = artRun?.status;
  const participants = artRun?.participants;

  const isParticipant = Boolean(
    me && participants?.some((p) => p.userId === me.id),
  );
  const isHost = Boolean(me && artRun?.host && me.id === artRun.host.userId);
  const canRun = runStatus === 'IN_PROGRESS' && (isParticipant || isHost);
  const active = status === 'success' && canRun;

  // 진행중이 아니거나 참가자/호스트가 아니면 상세로 돌려보낸다.
  // me 로딩이 끝난 뒤에만 판정해야 참가자가 잘못 튕기지 않는다 (상세/me 비동기 분리).
  useEffect(() => {
    if (status === 'success' && me && !canRun) {
      navigate(`/art-runs/${id}`, { replace: true });
    }
  }, [status, me, canRun, id, navigate]);

  const { position } = useGeoWatch(active);
  const { paths, markers, closed } = useArtRunRealtime({
    active,
    sessionId: id,
    myUserId,
    participants,
    position,
  });

  // 도안(점선) + 참가자 trail
  const designPath = useMemo(
    () => ({
      id: 'design',
      points: (artRun?.coordinates || []).map((point) => ({
        lat: point.latitude,
        lng: point.longitude,
      })),
      color: DESIGN_COLOR,
      dashed: true,
    }),
    [artRun],
  );
  const mapPaths = useMemo(() => [designPath, ...paths], [designPath, paths]);

  // 지도 중심은 최초 1회만 설정한다 (내 위치 우선, 없으면 모임 장소).
  // 이후 GPS 가 갱신돼도 자동으로 중앙 이동하지 않아 자유롭게 지도를 조작할 수 있다.
  useEffect(() => {
    if (mapCenter) {
      return;
    }
    if (position) {
      setMapCenter(position);
    } else if (artRun?.meetingPlace) {
      setMapCenter({
        lat: artRun.meetingPlace.latitude,
        lng: artRun.meetingPlace.longitude,
      });
    }
  }, [position, artRun, mapCenter]);

  const center = mapCenter || DEFAULT_CENTER;

  if (status === 'loading') {
    return (
      <main className={styles.page}>
        <p className={styles.stateMessage}>불러오는 중...</p>
      </main>
    );
  }

  if (status === 'error' || !artRun) {
    return (
      <main className={styles.page}>
        <p className={styles.stateMessage}>정보를 불러오지 못했어요.</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <KakaoMap
        center={center}
        recenterKey={recenterKey}
        paths={mapPaths}
        markers={markers}
        className={styles.map}
      />

      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(`/art-runs/${id}`)}
          aria-label="뒤로 가기"
        >
          ←
        </button>
        <span className={styles.title}>{artRun?.title}</span>
      </header>

      <button
        type="button"
        className={styles.locateButton}
        onClick={() => {
          if (position) {
            setMapCenter({ ...position });
            setRecenterKey((key) => key + 1);
          }
        }}
      >
        내 위치
      </button>

      <footer className={styles.footer}>
        {position ? (
          <span className={styles.hint}>
            참가자 {markers.length}명 · 내 경로가 실시간으로 그려지고 있어요
          </span>
        ) : (
          <span className={styles.hint}>위치 정보를 가져오는 중이에요...</span>
        )}
      </footer>

      {closed ? (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <p className={styles.overlayText}>호스트가 러닝을 종료했어요.</p>
            <button
              type="button"
              className={styles.overlayButton}
              onClick={() => navigate(`/art-runs/${id}`, { replace: true })}
            >
              돌아가기
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
