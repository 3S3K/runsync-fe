import { SLOPE_GRADES, getSlopeGrade } from '../../utils/course-format';

import CourseSection from './course-section';
import styles from './elevation-chart.module.css';

const WIDTH = 320;
const HEIGHT = 170;
const PAD = { top: 16, right: 14, bottom: 40, left: 34 };
const PLOT_WIDTH = WIDTH - PAD.left - PAD.right;
const PLOT_HEIGHT = HEIGHT - PAD.top - PAD.bottom;
const BAND_Y = HEIGHT - PAD.bottom + 6;
const Y_STEPS_M = [5, 10, 20, 40, 50, 100, 200];
const FLAT_SLOPE_PCT = 0.5;

/** 고도 범위에 맞는 y축 눈금 (4칸 이하가 되는 가장 작은 간격) */
function getYAxis(profile) {
  const elevations = profile.map((point) => point.elevationM);
  const min = Math.min(...elevations);
  const max = Math.max(...elevations);
  const step = Y_STEPS_M.find((candidate) => (max - min) / candidate <= 4) ?? 200;
  const low = Math.floor(min / step) * step;
  const high = Math.max(Math.ceil(max / step) * step, low + step);
  const ticks = [];
  for (let value = low; value <= high; value += step) {
    ticks.push(value);
  }
  return { low, high, ticks };
}

function getKmTicks(totalM) {
  const totalKm = totalM / 1000;
  let stepKm = 5;
  if (totalKm <= 6) {
    stepKm = 1;
  } else if (totalKm <= 12) {
    stepKm = 2;
  }
  const ticks = [];
  for (let km = 0; km <= totalKm + 0.001; km += stepKm) {
    ticks.push(km);
  }
  return ticks;
}

/** 두 표본 사이 구간의 경사 등급. 색 띠는 표본의 경사가 아니라 구간 자체의 경사로 칠한다 */
function getSpanGrade(from, to) {
  const run = to.distanceM - from.distanceM;
  return getSlopeGrade(run > 0 ? ((to.elevationM - from.elevationM) / run) * 100 : 0);
}

function getSlopeText(point) {
  const grade = SLOPE_GRADES[point.grade].label;
  if (Math.abs(point.slopePct) < FLAT_SLOPE_PCT) {
    return `평지 · ${grade}`;
  }
  const direction = point.slopePct > 0 ? '오르막' : '내리막';
  return `${direction} ${Math.abs(point.slopePct).toFixed(1)}% · ${grade}`;
}

function Readout({ profile, activePoint }) {
  if (!activePoint) {
    const elevations = profile.map((point) => point.elevationM);
    return (
      <p className={styles.readout}>
        <strong className={styles.readoutValue}>
          {Math.round(Math.min(...elevations))}~{Math.round(Math.max(...elevations))} m
        </strong>
        코스의 고도 범위
      </p>
    );
  }

  return (
    <p className={styles.readout}>
      <strong className={styles.readoutValue}>{Math.round(activePoint.elevationM)} m</strong>
      <span
        className={styles.readoutDot}
        style={{ backgroundColor: SLOPE_GRADES[activePoint.grade].color }}
      />
      {(activePoint.distanceM / 1000).toFixed(2)} km · {getSlopeText(activePoint)}
    </p>
  );
}

/**
 * 코스의 고도 프로필 차트. 그래프를 누르거나 끌면 해당 지점의 고도와 경사를 보여준다.
 * @param {Array<{ distanceM: number, elevationM: number, slopePct: number, grade: string }>} profile
 * @param {number | null} activeIndex 보고 있는 지점의 순번
 * @param {(index: number) => void} onActiveChange
 */
export default function ElevationChart({ profile, activeIndex, onActiveChange }) {
  if (profile.length < 2) {
    return null;
  }

  const totalM = profile[profile.length - 1].distanceM;
  const { low, high, ticks } = getYAxis(profile);
  const getX = (distanceM) => PAD.left + (distanceM / totalM) * PLOT_WIDTH;
  const getY = (elevationM) => PAD.top + (1 - (elevationM - low) / (high - low)) * PLOT_HEIGHT;

  const linePath = profile
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${getX(point.distanceM).toFixed(1)},${getY(point.elevationM).toFixed(1)}`)
    .join(' ');
  const baseY = PAD.top + PLOT_HEIGHT;
  const areaPath = `${linePath} L${getX(totalM).toFixed(1)},${baseY} L${PAD.left},${baseY} Z`;

  const peak = profile.reduce((best, point) => (point.elevationM > best.elevationM ? point : best));
  const isPeakOnRight = getX(peak.distanceM) > PAD.left + PLOT_WIDTH * 0.7;
  const activePoint = activeIndex != null ? profile[activeIndex] : null;

  const handlePointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = Math.min(Math.max((x - PAD.left) / PLOT_WIDTH, 0), 1);
    const targetM = ratio * totalM;
    const nearestIndex = profile.reduce(
      (best, point, index) => (
        Math.abs(point.distanceM - targetM) < Math.abs(profile[best].distanceM - targetM) ? index : best
      ),
      0,
    );
    if (nearestIndex !== activeIndex) {
      onActiveChange(nearestIndex);
    }
  };

  const handleKeyDown = (event) => {
    const lastIndex = profile.length - 1;
    const currentIndex = activeIndex ?? 0;
    const nextIndexByKey = {
      ArrowLeft: Math.max(currentIndex - 1, 0),
      ArrowRight: activeIndex == null ? 0 : Math.min(currentIndex + 1, lastIndex),
      Home: 0,
      End: lastIndex,
    };
    const nextIndex = nextIndexByKey[event.key];
    if (nextIndex == null) {
      return;
    }
    event.preventDefault();
    if (nextIndex !== activeIndex) {
      onActiveChange(nextIndex);
    }
  };

  return (
    <CourseSection
      title="고도 프로필"
      aside={<span className={styles.aside}>그래프를 눌러 따라가 보세요</span>}
    >
      <Readout
        profile={profile}
        activePoint={activePoint}
      />

      <svg
        className={styles.chart}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="slider"
        tabIndex={0}
        aria-label="고도 프로필에서 볼 지점. 좌우 화살표 키로 이동"
        aria-valuemin={0}
        aria-valuemax={Math.round(totalM)}
        aria-valuenow={activePoint ? activePoint.distanceM : 0}
        aria-valuetext={activePoint
          ? `${(activePoint.distanceM / 1000).toFixed(2)}km 지점, 고도 ${Math.round(activePoint.elevationM)}m, ${getSlopeText(activePoint)}`
          : '지점을 선택하지 않음'}
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        onKeyDown={handleKeyDown}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              className={styles.gridLine}
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={getY(tick)}
              y2={getY(tick)}
            />
            <text
              className={styles.axisText}
              x={PAD.left - 6}
              y={getY(tick) + 3}
              textAnchor="end"
            >
              {tick}
            </text>
          </g>
        ))}

        <path
          className={styles.area}
          d={areaPath}
        />
        <path
          className={styles.line}
          d={linePath}
        />

        <circle
          className={styles.peakDot}
          cx={getX(peak.distanceM)}
          cy={getY(peak.elevationM)}
          r="2.5"
        />
        <text
          className={styles.peakText}
          x={getX(peak.distanceM) + (isPeakOnRight ? -6 : 6)}
          y={getY(peak.elevationM) - 5}
          textAnchor={isPeakOnRight ? 'end' : 'start'}
        >
          최고 {Math.round(peak.elevationM)}m
        </text>

        {profile.slice(0, -1).map((point, index) => (
          <rect
            key={`${index}-${point.distanceM}`}
            x={getX(point.distanceM)}
            y={BAND_Y}
            width={Math.max(getX(profile[index + 1].distanceM) - getX(point.distanceM) + 0.3, 0)}
            height="5"
            fill={SLOPE_GRADES[getSpanGrade(point, profile[index + 1])].color}
          />
        ))}

        {getKmTicks(totalM).map((km) => (
          <text
            key={km}
            className={styles.axisText}
            x={getX(km * 1000)}
            y={HEIGHT - 8}
            textAnchor="middle"
          >
            {km === 0 ? '0' : km}
          </text>
        ))}
        <text
          className={styles.axisText}
          x={WIDTH - PAD.right}
          y={HEIGHT - 8}
          textAnchor="end"
        >
          km
        </text>

        {activePoint ? (
          <g>
            <line
              className={styles.cursorLine}
              x1={getX(activePoint.distanceM)}
              x2={getX(activePoint.distanceM)}
              y1={PAD.top}
              y2={BAND_Y + 5}
            />
            <circle
              className={styles.cursorDot}
              cx={getX(activePoint.distanceM)}
              cy={getY(activePoint.elevationM)}
              r="4"
            />
          </g>
        ) : null}
      </svg>
    </CourseSection>
  );
}
