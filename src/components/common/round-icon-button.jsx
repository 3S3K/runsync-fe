import styles from './round-icon-button.module.css';

export function RoundIconButton({
  label,
  onClick,
  variant = 'light',
  className = '',
}) {
  const variantClass = variant === 'navy' ? styles.navy : styles.light;
  const rootClassName = className
    ? `${styles.button} ${variantClass} ${className}`
    : `${styles.button} ${variantClass}`;

  return (
    <button
      type="button"
      className={rootClassName}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
