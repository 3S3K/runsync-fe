import { useEffect, useState } from 'react';
import { MdCheck } from 'react-icons/md';

import styles from './course-loading-sheet.module.css';

/** 추천 서버가 실제로 거치는 단계. 진행률은 서버가 알려주지 않아 시간에 맞춰 넘긴다 */
const BASE_STEPS = [
  { title: '러닝 기록 분석', detail: null },
  { title: '지형 고도 반영', detail: 'Copernicus DEM 고도 자료' },
  { title: '보행 도로망 탐색', detail: 'OpenStreetMap 보행 가능 도로' },
  { title: '경사·계단 가중치 적용', detail: '오르막과 계단은 더 먼 길로 계산' },
  { title: '순환 코스 생성·순위 결정', detail: '여러 방향의 후보 중 상위 3개' },
];
const STEP_INTERVAL_MS = 480;
const FINISH_DELAY_MS = 380;

function getStepState(index, activeIndex) {
  if (index < activeIndex) {
    return 'done';
  }
  return index === activeIndex ? 'active' : 'waiting';
}

/**
 * 추천 생성 중 화면의 아래쪽 시트. 단계 목록과 진행 막대를 보여준다.
 * @param {string} conditionText 요청 조건 요약 (예: "5km · 보통 · 현재 위치 출발")
 * @param {string | null} [recordText] 반영하는 러닝 기록 요약
 * @param {boolean} [isReady] 추천 응답이 도착했는지
 * @param {() => void} onComplete 마지막 단계까지 표시를 마쳤을 때
 */
export default function CourseLoadingSheet({
  conditionText,
  recordText = null,
  isReady = false,
  onComplete,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndex = BASE_STEPS.length - 1;
  const isFinished = activeIndex > lastIndex;

  // 마지막 단계 전까지는 일정 간격으로 넘기고, 마지막 단계는 응답이 올 때까지 기다린다
  useEffect(() => {
    if (isFinished) {
      const timer = setTimeout(onComplete, FINISH_DELAY_MS);
      return () => clearTimeout(timer);
    }
    if (activeIndex === lastIndex && !isReady) {
      return undefined;
    }
    const timer = setTimeout(() => setActiveIndex((index) => index + 1), STEP_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [activeIndex, isFinished, isReady, lastIndex, onComplete]);

  const steps = BASE_STEPS.map((step, index) => (index === 0
    ? { ...step, detail: recordText ?? '기록이 없어 기본값으로 계산해요' }
    : step));
  const progressPct = Math.min((activeIndex / BASE_STEPS.length) * 100, 100);

  return (
    <section
      className={styles.sheet}
      aria-live="polite"
    >
      <h2 className={styles.title}>맞춤 코스를 찾고 있어요</h2>
      <p className={styles.condition}>{conditionText}</p>

      <ol className={styles.steps}>
        {steps.map((step, index) => {
          const state = getStepState(index, activeIndex);
          return (
            <li
              key={step.title}
              className={`${styles.step} ${styles[state]}`}
            >
              <span className={styles.mark}>
                {state === 'done' ? (
                  <MdCheck
                    size={14}
                    aria-hidden="true"
                  />
                ) : null}
              </span>
              <div>
                <p className={styles.stepTitle}>{step.title}</p>
                {state !== 'waiting' ? <p className={styles.stepDetail}>{step.detail}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div
        className={styles.progress}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progressPct)}
      >
        <span
          className={styles.progressBar}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </section>
  );
}
