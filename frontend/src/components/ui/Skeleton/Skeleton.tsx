import styles from './Skeleton.module.css';

interface SkeletonProps {
  variant?: 'text' | 'title' | 'card';
  width?: string;
  height?: string;
}

export function Skeleton({ variant = 'text', width, height }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return <div className={`${styles.skeleton} ${styles[variant]}`} style={style} />;
}

export function SkeletonCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Skeleton variant="title" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
    </div>
  );
}
