'use client';

import { useAtom } from 'jotai';
import { useCallback, useRef, useState } from 'react';
import { gallerySettingAtom } from '@/store/app';
import { cn } from '@/lib/utils';

interface ColumnSliderProps {
  min?: number;
  max?: number;
  step?: number;
  autoLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const ColumnSlider = ({
  min = 2,
  max = 8,
  step = 1,
  autoLabel = '自动',
  className,
  disabled = false,
}: ColumnSliderProps) => {
  const [gallerySetting, setGallerySetting] = useAtom(gallerySettingAtom);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const value = gallerySetting.columns;

  const onChange = useCallback((newValue: number | 'auto') => {
    setGallerySetting(prev => ({
      ...prev,
      columns: newValue,
    }));
  }, [setGallerySetting]);

  // 将值转换为位置百分比
  const getPositionFromValue = useCallback(
    (val: number | 'auto') => {
      if (val === 'auto') return 5; // 自动档位置稍微偏右一点
      // 数值档从 15% 开始到 100%
      return 15 + ((val - min) / (max - min)) * 85;
    },
    [min, max],
  );

  // 将位置百分比转换为值
  const getValueFromPosition = useCallback(
    (position: number) => {
      if (position <= 12) return 'auto'; // 左侧 12% 区域为自动档
      const normalizedPosition = (position - 15) / 85; // 从 15% 开始的 85% 区域为数值
      const rawValue = min + Math.max(0, normalizedPosition) * (max - min);
      return Math.round(Math.max(min, rawValue) / step) * step;
    },
    [min, max, step],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return;

      event.preventDefault();
      setIsDragging(true);

      const updateValue = (clientX: number) => {
        if (!trackRef.current) return;

        const rect = trackRef.current.getBoundingClientRect();
        const position = ((clientX - rect.left) / rect.width) * 100;
        const clampedPosition = Math.max(0, Math.min(100, position));
        const newValue = getValueFromPosition(clampedPosition);

        if (newValue !== value) {
          onChange(newValue);
        }
      };

      updateValue(event.clientX);

      const handlePointerMove = (e: PointerEvent) => {
        updateValue(e.clientX);
      };

      const handlePointerUp = () => {
        setIsDragging(false);
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [disabled, value, onChange, getValueFromPosition],
  );

  const position = getPositionFromValue(value);

  return (
    <div className={cn('w-full', className)}>
      {/* 标签 */}
      <div className="mb-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{autoLabel}</span>
        <span>{max} 列</span>
      </div>

      {/* 滑块轨道 */}
      <div
        ref={sliderRef}
        className={cn(
          'relative h-6 cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onPointerDown={handlePointerDown}
      >
        {/* 背景轨道 */}
        <div
          ref={trackRef}
          className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-gray-200 dark:bg-gray-700"
        >
          {/* 自动档区域指示 */}
          <div className="absolute top-0 left-0 h-full w-[12%] rounded-l-full bg-blue-100 dark:bg-blue-900/50" />

          {/* 激活区域 */}
          <div
            className={cn(
              'absolute top-0 h-full rounded-full transition-all duration-150 max-w-full',
              value === 'auto' ? 'bg-blue-500' : 'bg-primary',
            )}
            style={{
              width: `${Math.max(position, 5)}%`,
              borderRadius: value === 'auto' ? '9999px 0 0 9999px' : '9999px',
            }}
          />
        </div>

        {/* 滑块把手 */}
        <div
          className={cn(
            'absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg transition-all duration-150',
            isDragging ? 'scale-110' : 'hover:scale-105',
            value === 'auto' ? 'bg-blue-500' : 'bg-primary',
            disabled && 'cursor-not-allowed',
          )}
          style={{
            left: `${position}%`,
          }}
        />

        {/* 数值刻度 */}
        <div className="absolute top-full mt-1 flex w-full text-xs text-gray-400 dark:text-gray-500">
          <div className="w-[15%] text-left">
            <span
              className={cn(
                'transition-colors',
                value === 'auto' && 'font-medium text-blue-500',
              )}
            >
              {autoLabel}
            </span>
          </div>
          <div className="flex w-[85%] justify-between">
            {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(
              (num) => (
                <span
                  key={num}
                  className={cn(
                    'transition-colors',
                    value === num && 'font-medium text-primary',
                  )}
                >
                  {num}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      {/* 当前值显示 */}
      <div className="mt-8 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
        {value === 'auto' ? autoLabel : `${value} 列`}
      </div>
    </div>
  );
};