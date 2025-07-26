import { useCallback, useRef } from 'react';

/**
 * 防抖hook - 在指定延迟后执行函数，如果在延迟期间再次调用则重新计时
 * @param callback 要执行的回调函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 设置新的定时器
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}

/**
 * 立即防抖hook - 立即执行一次，然后在指定延迟内忽略后续调用
 * @param callback 要执行的回调函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function useDebounceImmediate<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTime = useRef<number>(0);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      // 如果距离上次调用时间超过延迟，立即执行
      if (now - lastCallTime.current >= delay) {
        callback(...args);
        lastCallTime.current = now;
        return;
      }

      // 否则设置定时器延迟执行
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastCallTime.current = Date.now();
      }, delay - (now - lastCallTime.current));
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}