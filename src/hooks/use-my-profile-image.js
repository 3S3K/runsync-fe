import { useEffect, useState } from 'react';

import { getMe } from '../api/user';

/**
 * 내 프로필 사진 주소를 불러오는 훅. 지도에서 내 위치 마커에 쓴다.
 * 불러오지 못하면 null 이고, 마커는 기본 그림으로 표시된다.
 * @returns {string | null}
 */
export function useMyProfileImage() {
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      try {
        const me = await getMe();
        if (isActive) {
          setProfileImage(me?.profileImage || null);
        }
      } catch (error) {
        console.error('내 프로필 조회 실패', error);
      }
    };
    loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  return profileImage;
}
