'use client';

import { useEffect, useState } from 'react';
import styles from './LoadingScreen.module.css';

interface Props {
  visible: boolean;
}

export function LoadingScreen({ visible }: Props) {
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (!visible) {
      setLeaving(true);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    } else {
      setLeaving(false);
      setMounted(true);
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <div className={`${styles.screen} ${leaving ? styles.leaving : ''}`}>
      <div className={styles.logo}>
        edway<span>.</span>space
      </div>
      <div className={styles.bar}>
        <div className={styles.runner} />
      </div>
    </div>
  );
}
