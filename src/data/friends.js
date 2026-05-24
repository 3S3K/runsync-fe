import friendGildong from '../assets/friend-gildong.png';
import friendHw0o from '../assets/friend-hw0o.png';
import friendKim0101 from '../assets/friend-kim0101.png';
import friendMk1nur from '../assets/friend-mk1nur.png';

/**
 * 현재 사용자 (추후 API / auth 연동)
 */
export const currentUser = {
  id: 'me',
  name: '한현우',
  handle: '@hw0o',
  status: 'me',
  statusLabel: '현재 러닝 중',
  avatarSrc: friendHw0o,
  mapPosition: { top: 48, left: 45 },
};

/**
 * 임시 친구 목록 (추후 API 응답으로 교체)
 * status: me | running | recent | offline
 */
export const friends = [
  {
    id: 'friend-1',
    name: '박민경',
    handle: '@mk1nur',
    status: 'running',
    statusLabel: '현재 러닝 중',
    avatarSrc: friendMk1nur,
    mapPosition: { top: 40, left: 28 },
  },
  {
    id: 'friend-2',
    name: '김태경',
    handle: '@kim0101',
    status: 'offline',
    statusLabel: '오프라인',
    avatarSrc: friendKim0101,
    mapPosition: { top: 58, left: 55 },
  },
  {
    id: 'friend-3',
    name: '고길동',
    handle: '@1234gogogo',
    status: 'offline',
    statusLabel: '오프라인',
    avatarSrc: friendGildong,
    mapPosition: { top: 36, left: 72 },
  },
];

/** 친구 목록 패널용 (본인 포함) */
export const friendsWithMe = [currentUser, ...friends];
