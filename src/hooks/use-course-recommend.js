import { useCallback, useState } from 'react';

import { recommendCourses } from '../api/course';
import { mapCourse } from '../utils/course-mapper';

/**
 * AI 코스 추천 요청 상태를 관리하는 훅.
 * @returns {{
 *   courses: Array<object>,
 *   status: 'idle' | 'loading' | 'success' | 'error',
 *   error: string | null,
 *   recommend: (request: { startLat: number, startLng: number, targetDistanceKm: number, intensity: string }) => Promise<void>,
 * }}
 */
export function useCourseRecommend() {
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const recommend = useCallback(async (request) => {
    setStatus('loading');
    setError(null);

    try {
      const result = await recommendCourses(request);
      setCourses(result.map(mapCourse));
      setStatus('success');
    } catch (requestError) {
      setCourses([]);
      // 서비스 지역 밖, 코스 없음 등은 서버가 안내 문구를 내려준다
      setError(requestError?.message || '코스를 추천받지 못했어요. 다시 시도해 주세요.');
      setStatus('error');
    }
  }, []);

  return { courses, status, error, recommend };
}
