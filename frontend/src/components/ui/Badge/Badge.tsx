import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  variant: 'accent' | 'outline' | 'danger' | 'muted';
}

export function Badge({ children, variant }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}
