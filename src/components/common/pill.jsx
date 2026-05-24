import styles from './pill.module.css';

export function Pill({
  children,
  variant = 'light',
  className = '',
}) {
  const variantClass = variant === 'navy' ? styles.navy : styles.light;
  const rootClassName = className
    ? `${styles.pill} ${variantClass} ${className}`
    : `${styles.pill} ${variantClass}`;

  return (
    <span className={rootClassName}>
      {children}
    </span>
  );
}
