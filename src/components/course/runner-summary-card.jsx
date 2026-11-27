import { MdAutoAwesome } from 'react-icons/md';

import { formatPace, formatShortDate, getFitnessLevelLabel } from '../../utils/course-format';

import CourseSection from './course-section';
import styles from './runner-summary-card.module.css';

function getPeriodText(summary) {
  const runs = summary.recentRuns;
  if (runs.length === 0) {
    return '';
  }
  const first = formatShortDate(runs[0].date);
  const last = formatShortDate(runs[runs.length - 1].date);
  const period = first === last ? first : `${first} ~ ${last}`;
  return `최근 ${summary.recordCount}회 · ${period}`;
}

function StatTile({ label, value, unit }) {
  return (
    <div className={styles.tile}>
      <span className={styles.tileLabel}>{label}</span>
      <span className={styles.tileValue}>
        {value ?? '–'}
        {value != null ? <span className={styles.tileUnit}>{unit}</span> : null}
      </span>
    </div>
  );
}

function RecentRunChart({ runs }) {
  const maxDistance = Math.max(...runs.map((run) => run.distanceKm));

  return (
    <figure className={styles.chart}>
      <ol className={styles.bars}>
        {runs.map((run, index) => {
          const isLatest = index === runs.length - 1;
          return (
            <li
              key={`${run.date}-${index}`}
              className={styles.barItem}
            >
              <span className={isLatest ? `${styles.barValue} ${styles.barValueLatest}` : styles.barValue}>
                {run.distanceKm.toFixed(1)}
              </span>
              <span className={styles.barTrack}>
                <span
                  className={isLatest ? `${styles.bar} ${styles.barLatest}` : styles.bar}
                  style={{ height: `${Math.max((run.distanceKm / maxDistance) * 100, 8)}%` }}
                />
              </span>
              <span className={styles.barDate}>{formatShortDate(run.date)}</span>
            </li>
          );
        })}
      </ol>
      <figcaption className={styles.chartCaption}>회차별 거리 (km)</figcaption>
    </figure>
  );
}

/**
 * 내 러닝 분석 카드. 코스 추천에 반영되는 최근 기록을 요약해 보여준다.
 * @param {object | null} summary 내 러닝 분석 응답
 * @param {'loading' | 'success' | 'error'} status
 */
export default function RunnerSummaryCard({ summary, status }) {
  if (status === 'loading') {
    return (
      <CourseSection title="내 러닝 분석">
        <p className={styles.message}>러닝 기록을 불러오는 중이에요.</p>
      </CourseSection>
    );
  }

  // 분석을 못 불러와도 추천은 받을 수 있어 카드만 숨긴다
  if (!summary) {
    return null;
  }

  if (summary.recordCount === 0) {
    return (
      <CourseSection title="내 러닝 분석">
        <p className={styles.message}>
          아직 러닝 기록이 없어요. 기록이 쌓이면 내 페이스와 심박에 맞춰 코스를 골라 드려요.
        </p>
      </CourseSection>
    );
  }

  const fitnessLabel = getFitnessLevelLabel(summary.fitnessLevel);

  return (
    <CourseSection
      title="내 러닝 분석"
      aside={fitnessLabel ? (
        <span className={styles.badge}>
          <span className={styles.badgeLabel}>체력 수준</span>
          {fitnessLabel}
        </span>
      ) : null}
    >
      <p className={styles.period}>{getPeriodText(summary)}</p>

      <div className={styles.tiles}>
        <StatTile
          label="평균 페이스"
          value={formatPace(summary.averagePaceSecPerKm)}
          unit="/km"
        />
        <StatTile
          label="평균 심박"
          value={summary.averageHeartRate}
          unit="bpm"
        />
        <StatTile
          label="케이던스"
          value={summary.averageCadence}
          unit="spm"
        />
        <StatTile
          label="주간 거리"
          value={summary.weeklyDistanceKm.toFixed(1)}
          unit="km"
        />
      </div>

      <RecentRunChart runs={summary.recentRuns} />

      <p className={styles.note}>
        <MdAutoAwesome
          size={16}
          aria-hidden="true"
        />
        이 기록의 페이스·거리·케이던스로 코스별 예상 심박과 소요 시간을 계산해요.
      </p>
    </CourseSection>
  );
}
