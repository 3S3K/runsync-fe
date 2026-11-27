import styles from './course-section.module.css';

/**
 * 코스 추천 화면의 흰색 카드 한 칸.
 * @param {string} title 카드 제목
 * @param {React.ReactNode} [aside] 제목 오른쪽에 놓는 보조 내용
 * @param {React.ReactNode} [icon] 제목 앞 아이콘
 * @param {React.ReactNode} children
 */
export default function CourseSection({ title, aside = null, icon = null, children }) {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          {icon}
          {title}
        </h2>
        {aside}
      </header>
      {children}
    </section>
  );
}
