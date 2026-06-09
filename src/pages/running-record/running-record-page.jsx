import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MdAccessTime,
  MdDirectionsRun,
  MdEditNote,
  MdFavoriteBorder,
  MdLocalFireDepartment,
  MdLocationOn,
  MdRunCircle,
  MdSpeed,
  MdTerrain,
} from 'react-icons/md';

import KakaoMap from '../../components/map/kakao-map';
import { useRunningRecord } from '../../hooks/use-running-record';
import {
  getRunningRecordDetails,
  getRunningRecordStats,
} from '../../data/runningRecord';
import { DEFAULT_CENTER } from '../../utils/geolocation';
import { smoothPath } from '../../utils/smooth-path';

import styles from './running-record-page.module.css';

const STAT_ICONS = {
  pace: MdSpeed,
  duration: MdAccessTime,
  calories: MdLocalFireDepartment,
  elevation: MdTerrain,
  heartRate: MdFavoriteBorder,
  cadence: MdRunCircle,
};

const DETAIL_ICONS = {
  location: MdLocationOn,
  timeRange: MdAccessTime,
  runningType: MdDirectionsRun,
  memo: MdEditNote,
};

export default function RunningRecordPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { record, isLoading } = useRunningRecord(id);

  // 경로 폴리라인과 지도 중심(경로 중간점) — early return 위에서 hook 순서 고정
  const routePaths = useMemo(
    () => [{ id: 'route', points: smoothPath(record?.paths ?? []), color: '#ff5a1f' }],
    [record],
  );
  const mapCenter = useMemo(() => {
    const points = record?.paths ?? [];
    if (points.length === 0) {
      return DEFAULT_CENTER;
    }
    return points[Math.floor(points.length / 2)];
  }, [record]);

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <header className={styles.header}>
            <button
              type="button"
              className={styles.backButton}
              aria-label="뒤로 가기"
              onClick={handleBack}
            >
              <span className={styles.backIcon} aria-hidden="true" />
            </button>
          </header>
          <p className={styles.loadingText}>러닝 기록을 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (!record) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <header className={styles.header}>
            <button
              type="button"
              className={styles.backButton}
              aria-label="뒤로 가기"
              onClick={handleBack}
            >
              <span className={styles.backIcon} aria-hidden="true" />
            </button>
          </header>
          <p className={styles.notFoundText}>러닝 기록을 찾을 수 없습니다.</p>
        </div>
      </main>
    );
  }

  const stats = getRunningRecordStats(record);
  const details = getRunningRecordDetails(record);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            aria-label="뒤로 가기"
            onClick={handleBack}
          >
            <span className={styles.backIcon} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.content}>
          <section className={styles.hero} aria-label="러닝 기록 요약">
            <p className={styles.timeMeta}>{record.timeMeta}</p>
            <h1 className={styles.title}>{record.title}</h1>
            <div className={styles.mainDistanceBlock}>
              <span className={styles.mainDistanceValue}>
                {record.distanceKm}
              </span>
              <span className={styles.mainDistanceUnit}>km</span>
            </div>
          </section>

          <section className={styles.statsCard} aria-label="러닝 통계">
            <div className={styles.statsGrid}>
              {stats.map((stat, index) => {
                const Icon = STAT_ICONS[stat.id];
                const hasDivider = index % 3 !== 2;

                return (
                  <div
                    key={stat.id}
                    className={
                      hasDivider
                        ? `${styles.statCell} ${styles.statCellDivider}`
                        : styles.statCell
                    }
                  >
                    <span className={styles.statIconWrap}>
                      <Icon className={styles.statIcon} aria-hidden="true" />
                    </span>
                    <span className={styles.statValue}>{stat.value}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.mapCard} aria-label="러닝 경로 지도">
            {record.paths && record.paths.length > 0 ? (
              <KakaoMap
                center={mapCenter}
                level={5}
                paths={routePaths}
                className={styles.map}
              />
            ) : (
              <div className={styles.mapEmpty}>경로 정보가 없어요.</div>
            )}
          </section>

          <section className={styles.detailCard} aria-label="상세 정보">
            <ul className={styles.detailList}>
              {details.map((item) => {
                const Icon = DETAIL_ICONS[item.id];

                if (item.isTimeRange) {
                  return (
                    <li key={item.id} className={styles.detailItem}>
                      <span className={styles.detailIconWrap}>
                        <Icon className={styles.detailIcon} aria-hidden="true" />
                      </span>
                      <div className={styles.timeRangeBody}>
                        <div className={styles.timeRangeCol}>
                          <span className={styles.detailLabel}>{item.startLabel}</span>
                          <span className={styles.detailValue}>{item.startValue}</span>
                        </div>
                        <div className={styles.timeRangeDivider} aria-hidden="true" />
                        <div className={styles.timeRangeCol}>
                          <span className={styles.detailLabel}>{item.endLabel}</span>
                          <span className={styles.detailValue}>{item.endValue}</span>
                        </div>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.id} className={styles.detailItem}>
                    <span className={styles.detailIconWrap}>
                      <Icon className={styles.detailIcon} aria-hidden="true" />
                    </span>
                    <div className={styles.detailBody}>
                      <span className={styles.detailLabel}>{item.label}</span>
                      <span className={styles.detailValue}>{item.value}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
