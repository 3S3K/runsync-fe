import { MdAutoAwesome } from 'react-icons/md';

import CourseSection from './course-section';
import styles from './course-reason.module.css';

/** 추천 이유를 문장 단위로 나눈다. "5.1km" 같은 소수점은 뒤에 공백이 없어 나뉘지 않는다 */
function splitSentences(reason) {
  return (reason ?? '')
    .split(/\.\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => (sentence.endsWith('.') ? sentence : `${sentence}.`));
}

function getDistanceChip(distanceKm, targetDistanceKm) {
  const diffPct = Math.round(((distanceKm - targetDistanceKm) / targetDistanceKm) * 100);
  if (diffPct === 0) {
    return '목표 거리와 일치';
  }
  return `목표 대비 ${diffPct > 0 ? '+' : '−'}${Math.abs(diffPct)}%`;
}

function getChips(course, targetDistanceKm) {
  const chips = [`최대 경사 ${course.maxSlopePct.toFixed(1)}%`];
  if (course.stairsCount != null) {
    chips.push(course.stairsCount === 0 ? '계단 없음' : `계단 ${course.stairsCount}곳`);
  }
  chips.push(course.biggestClimb ? `가장 큰 오르막 +${course.biggestClimb.gainM}m` : '큰 오르막 없음');
  chips.push(getDistanceChip(course.distanceKm, targetDistanceKm));
  return chips;
}

/**
 * 추천 이유 카드. 서버가 만든 이유 문장과 코스 특징 요약 칩을 보여준다.
 * @param {object} course 화면용 코스 (course-mapper 의 mapCourse 결과)
 * @param {number} targetDistanceKm 요청한 목표 거리
 */
export default function CourseReason({ course, targetDistanceKm }) {
  const [headline, ...details] = splitSentences(course.reason);

  return (
    <CourseSection
      title="왜 이 코스인가요?"
      icon={(
        <MdAutoAwesome
          size={18}
          aria-hidden="true"
        />
      )}
    >
      <div className={styles.text}>
        {headline ? <p className={styles.headline}>{headline}</p> : null}
        {details.map((sentence) => (
          <p
            key={sentence}
            className={styles.detail}
          >
            {sentence}
          </p>
        ))}
      </div>

      <ul className={styles.chips}>
        {getChips(course, targetDistanceKm).map((chip) => (
          <li
            key={chip}
            className={styles.chip}
          >
            {chip}
          </li>
        ))}
      </ul>
    </CourseSection>
  );
}
