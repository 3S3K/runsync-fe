import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getMe, updateMyInfo } from '../../api/user';
import { invalidateMypageUserApisCache } from '../../utils/fetch-mypage-user-apis';

import styles from './profile-edit-page.module.css';

const GENDERS = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
];

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isTmpUser, setIsTmpUser] = useState(false);
  const [status, setStatus] = useState('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 현재 내 정보로 폼을 채운다
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const me = await getMe();
        if (cancelled) {
          return;
        }
        if (!me) {
          setStatus('error');
          return;
        }
        setNickname(me.nickname || '');
        setGender(me.gender || '');
        setBirthDate((me.birthDate || '').slice(0, 10));
        setProfileImage(me.profileImage || '');
        setIsTmpUser(me.role === 'TMP_USER');
        setStatus('success');
      } catch {
        if (!cancelled) {
          setStatus('error');
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const canSubmit = Boolean(
    nickname.trim() && gender && birthDate && !isSubmitting,
  );
  // 미래 날짜 선택 방지 (오늘까지) — 로컬 기준 YYYY-MM-DD
  const maxBirthDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      // profileImage 는 기존 값이 있을 때만 전송 (빈 값으로 덮어써 이미지가 지워지는 것 방지)
      const payload = { nickname: nickname.trim(), gender, birthDate };
      if (profileImage) {
        payload.profileImage = profileImage;
      }
      await updateMyInfo(payload);
      // 마이페이지가 최신 정보(닉네임/권한)를 다시 받도록 캐시 무효화
      invalidateMypageUserApisCache();
      navigate('/mypage');
    } catch {
      window.alert('저장에 실패했어요. 잠시 후 다시 시도해 주세요.');
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <p className={styles.stateMessage}>불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <p className={styles.stateMessage}>정보를 불러오지 못했어요.</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate('/mypage')}
            aria-label="뒤로 가기"
          >
            ←
          </button>
          <h1 className={styles.title}>프로필 편집</h1>
        </header>

        {isTmpUser ? (
          <p className={styles.notice}>
            성별과 생년월일을 입력하면 정회원으로 전환돼요.
          </p>
        ) : null}

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <label className={styles.field}>
            <span className={styles.label}>닉네임</span>
            <input
              className={styles.input}
              value={nickname}
              maxLength={20}
              placeholder="닉네임"
              onChange={(event) => setNickname(event.target.value)}
            />
          </label>

          <div className={styles.field}>
            <span
              className={styles.label}
              id="gender-label"
            >
              성별
            </span>
            <div
              className={styles.genderRow}
              role="radiogroup"
              aria-labelledby="gender-label"
            >
              {GENDERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="radio"
                  aria-checked={gender === item.value}
                  className={
                    gender === item.value
                      ? `${styles.genderButton} ${styles.genderButtonActive}`
                      : styles.genderButton
                  }
                  onClick={() => setGender(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>생년월일</span>
            <input
              className={styles.input}
              type="date"
              value={birthDate}
              max={maxBirthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </label>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!canSubmit}
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </form>
      </div>
    </main>
  );
}
