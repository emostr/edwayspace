import styles from './PageTransition.module.css';

interface Props {
  children: React.ReactNode;
}

export function PageTransition({ children }: Props) {
  return <div className={styles.wrap}>{children}</div>;
}
