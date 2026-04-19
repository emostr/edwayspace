'use client';

import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — edway.space`;
    return () => {
      document.title = 'edway.space';
    };
  }, [title]);
}
