import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <div className={styles.code}>404</div>
      <div className={styles.message}>Страница не найдена</div>
      <div className={styles.sub}>Такой страницы не существует</div>
      <Link href="/dashboard" className={styles.link}>На главную</Link>
    </div>
  );
}
