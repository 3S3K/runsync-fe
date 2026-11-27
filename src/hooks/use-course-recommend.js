import { useCallback, useRef, useState } from 'react';

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
  // 요청을 연달아 보냈을 때 먼저 보낸 요청의 응답이 늦게 와서 최신 결과를 덮어쓰지 않게 한다
  const latestRequestIdRef = useRef(0);

  const recommend = useCallback(async (request) => {
    latestRequestIdRef.current += 1;
    const requestId = latestRequestIdRef.current;

    setStatus('loading');
    setError(null);

    try {
      const result = await recommendCourses(request);
      if (requestId !== latestRequestIdRef.current) {
        return;
      }
      // 서버는 코스가 없으면 404 를 주지만, 빈 목록이 오더라도 로딩 화면에 멈추지 않게 한다
      if (result.length === 0) {
        setCourses([]);
        setError('조건에 맞는 코스를 찾지 못했어요. 거리나 출발 위치를 바꿔 보세요.');
        setStatus('error');
        return;
      }
      setCourses(result.map(mapCourse));
      setStatus('success');
    } catch (requestError) {
      if (requestId !== latestRequestIdRef.current) {
        return;
      }
      setCourses([]);
      // 서비스 지역 밖, 코스 없음 등은 서버가 안내 문구를 내려준다
      setError(requestError?.message || '코스를 추천받지 못했어요. 다시 시도해 주세요.');
      setStatus('error');
    }
  }, []);

  return { courses, status, error, recommend };
}
