'use client';

import { useTheme } from 'next-themes';
import { useCallback } from 'react';
import { useIsMounted } from './useIsMounted';

/**
 * 它返回一个在明暗之间切换的函数。
 * @returns 切换主题的函数
 */
export const useToggleTheme = () => {
  const isMounted = useIsMounted();
  const { setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    if (!isMounted) return;
    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.contains('dark');

    setTheme(isDark ? 'light' : 'dark');
  }, [isMounted, setTheme]);

  return toggleTheme;
};
