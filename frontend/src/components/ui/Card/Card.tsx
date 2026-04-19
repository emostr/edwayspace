import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  accent?: boolean;
  onClick?: () => void;
}

export function Card({ children, accent = false, onClick }: CardProps) {
  const className = [
    styles.card,
    accent ? styles.accent : '',
    onClick ? styles.clickable : '',
  ].join(' ');

  if (onClick) {
    return (
      <div className={className} onClick={onClick} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}>
        {children}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}
