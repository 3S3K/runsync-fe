import statusStyles from '../styles/run-status.module.css';

/** 지도 마커에 표시할 status (활동 중인 사용자만) */
export const MAP_MARKER_STATUSES = ['me', 'running'];

export function isVisibleOnMap(status) {
  return MAP_MARKER_STATUSES.includes(status);
}

const DOT_CLASS = {
  me: statusStyles.dotMe,
  running: statusStyles.dotRunning,
  recent: statusStyles.dotRecent,
  offline: statusStyles.dotOffline,
};

const AVATAR_BORDER_CLASS = {
  me: statusStyles.avatarBorderMe,
  running: statusStyles.avatarBorderRunning,
  recent: statusStyles.avatarBorderRecent,
  offline: statusStyles.avatarBorderOffline,
};

export function getDotClassName(status) {
  return DOT_CLASS[status] || statusStyles.dotOffline;
}

export function getAvatarBorderClassName(status) {
  return AVATAR_BORDER_CLASS[status] || statusStyles.avatarBorderOffline;
}

export function toMapMarker(person) {
  return {
    id: person.id,
    status: person.status,
    top: person.mapPosition.top,
    left: person.mapPosition.left,
    initial: person.name.charAt(0),
    imageSrc: person.avatarSrc,
    imageAlt: person.name,
  };
}
