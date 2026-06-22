import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import KakaoMap from '../../components/map/kakao-map';
import { useArtRunResult } from '../../hooks/use-art-run-result';
import { getParticipantColor } from '../../utils/art-run-colors';
import { formatDuration } from '../../utils/format-date';
import { DEFAULT_CENTER } from '../../utils/geolocation';
import { smoothPath } from '../../utils/smooth-path';

import defaultAvatar from '../../assets/runner-man.png';
import styles from './art-run-result-page.module.css';

const DESIGN_COLOR = '#9e9e9e';

export default function ArtRunResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { result, status } = useArtRunResult(id);

  // 도안(점선) + 참가자별 경로(색상·스무딩)
  const mapPaths = useMemo(() => {
    if (!result) {
      return [];
    }

    const design = {
      id: 'design',
      points: (result.designCoordinates || []).map((point) => ({
        lat: point.latitude,
        lng: point.longitude,
      })),
      color: DESIGN_COLOR,
      dashed: true,
    };

    const trails = (result.participants || [])
      .filter((participant) => participant.paths && participant.paths.length >= 2)
      .map((participant) => ({
        id: `participant-${participant.userId}`,
        points: smoothPath(
          [...participant.paths]
            .sort((a, b) => a.sequence - b.sequence)
            .map((point) => ({ lat: point.latitude, lng: point.longitude })),
        ),
        color: getParticipantColor(participant.userId),
      }));

    return [design, ...trails];
  }, [result]);

  const center = useMemo(() => {
    const coords = result?.designCoordinates || [];
    if (coords.length === 0) {
      return DEFAULT_CENTER;
    }
    const mid = coords[Math.floor(coords.length / 2)];
    return { lat: mid.latitude, lng: mid.longitude };
  }, [result]);

  // 거리순 정렬 (많이 뛴 사람부터)
  const rankedParticipants = useMemo(
    () => [...(result?.participants || [])].sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0)),
    [result],
  );

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultAvatar;
  };

  if (status === 'loading') {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <p className={styles.stateMessage}>결과를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (status === 'error' || !result) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <p className={styles.stateMessage}>결과를 불러오지 못했어요.</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
          >
            ←
          </button>
          <h1 className={styles.title}>{result.title}</h1>
          <span className={styles.badge}>결과</span>
        </header>

        <div className={styles.mapWrap}>
          <KakaoMap
            center={center}
            paths={mapPaths}
            className={styles.map}
          />
        </div>

        <section className={styles.listSection}>
          <h2 className={styles.sectionTitle}>참가자 {rankedParticipants.length}명</h2>
          <ul className={styles.list}>
            {rankedParticipants.map((participant) => (
              <li
                key={participant.userId}
                className={styles.item}
              >
                <span
                  className={styles.colorDot}
                  style={{ background: getParticipantColor(participant.userId) }}
                  aria-hidden="true"
                />
                <img
                  className={styles.avatar}
                  src={participant.profileImage || defaultAvatar}
                  alt={participant.nickname}
                  onError={handleImageError}
                />
                <span className={styles.name}>{participant.nickname}</span>
                <span className={styles.stats}>
                  <span className={styles.distance}>{(participant.distance ?? 0).toFixed(2)}km</span>
                  <span className={styles.duration}>{formatDuration(participant.durationSeconds)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
