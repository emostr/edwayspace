import Link from 'next/link';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backLink?: { href: string; label: string };
}

export function PageHeader({ title, subtitle, backLink }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      {backLink && (
        <Link href={backLink.href} className={styles.back}>
          ← {backLink.label}
        </Link>
      )}
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
