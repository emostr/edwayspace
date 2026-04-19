'use client';

import { useState } from 'react';
import { copyToClipboard } from '@/lib/clipboard';
import styles from './CopyButton.module.css';

interface Props {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = 'Копировать' }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      className={`${styles.btn} ${copied ? styles.copied : ''}`}
      onClick={handleClick}
      type="button"
    >
      {copied ? '✓ Скопировано' : label}
    </button>
  );
}
