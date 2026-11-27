import { MAX_ACCURACY_M, isReliableFix } from './gps-filter';

const HERE = { lat: 36.3321, lng: 127.4562 };
// 위도 0.0001도는 약 11m
const ABOUT_11M_AWAY = { lat: 36.3322, lng: 127.4562 };
const ABOUT_110M_AWAY = { lat: 36.3331, lng: 127.4562 };

describe('isReliableFix', () => {
  it('오차가 기준 이하인 첫 위치는 쓴다', () => {
    expect(isReliableFix({ accuracy: 12, next: HERE })).toBe(true);
    expect(isReliableFix({ accuracy: MAX_ACCURACY_M, next: HERE })).toBe(true);
  });

  it('오차가 기준보다 큰 위치는 버린다', () => {
    expect(isReliableFix({ accuracy: MAX_ACCURACY_M + 1, next: HERE })).toBe(false);
  });

  it('오차 정보가 없으면 오차로는 걸러내지 않는다', () => {
    expect(isReliableFix({ accuracy: null, next: HERE })).toBe(true);
    expect(isReliableFix({ next: HERE })).toBe(true);
  });

  it('달리는 속도로 이동한 위치는 쓴다', () => {
    // 3초에 약 11m → 초속 3.7m
    expect(isReliableFix({ accuracy: 10, last: HERE, next: ABOUT_11M_AWAY, elapsedSec: 3 })).toBe(true);
  });

  it('사람이 낼 수 없는 속도로 튄 위치는 버린다', () => {
    // 1초에 약 110m
    expect(isReliableFix({ accuracy: 10, last: HERE, next: ABOUT_110M_AWAY, elapsedSec: 1 })).toBe(false);
  });

  it('신호가 끊겼다 돌아와 시간이 충분히 지났으면 멀리 옮겨 간 위치도 쓴다', () => {
    // 60초에 약 110m → 초속 1.8m
    expect(isReliableFix({ accuracy: 10, last: HERE, next: ABOUT_110M_AWAY, elapsedSec: 60 })).toBe(true);
  });

  it('지난 시간을 알 수 없으면 속도로는 걸러내지 않는다', () => {
    expect(isReliableFix({ accuracy: 10, last: HERE, next: ABOUT_110M_AWAY, elapsedSec: 0 })).toBe(true);
  });
});
