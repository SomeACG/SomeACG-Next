'use client';

import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { gallerySettingAtom } from '@/store/app';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface ColumnSliderProps {
  min?: number;
  max?: number;
  step?: number;
  autoLabel?: string;
  className?: string;
  disabled?: boolean;
}

type ColumnValue = number | 'auto';

// 预设的列数选项：自动、1、2、3、4、5、6、8、10
const COLUMN_OPTIONS = ['auto', 1, 2, 3, 4, 5, 6, 8, 10] as const;

// 分离计算逻辑为纯函数
const getPositionFromValue = (val: ColumnValue): number => {
  if (val === 'auto') return 5; // 自动档位置稍微偏右一点

  const numericOptions = COLUMN_OPTIONS.filter((opt) => opt !== 'auto') as number[];
  const index = numericOptions.indexOf(val as number);
  if (index === -1) return 15; // 如果不在预设中，默认位置

  // 数值档从 15% 开始到 100%
  return 15 + (index / (numericOptions.length - 1)) * 85;
};

const getValueFromPosition = (position: number): ColumnValue => {
  if (position <= 12) return 'auto'; // 左侧 12% 区域为自动档

  const numericOptions = COLUMN_OPTIONS.filter((opt) => opt !== 'auto') as number[];
  const normalizedPosition = (position - 15) / 85; // 从 15% 开始的 85% 区域为数值
  const index = Math.round(normalizedPosition * (numericOptions.length - 1));
  const clampedIndex = Math.max(0, Math.min(numericOptions.length - 1, index));

  return numericOptions[clampedIndex];
};

export const ColumnSlider = ({ autoLabel = '自动', className, disabled = false }: ColumnSliderProps) => {
  const [gallerySetting, setGallerySetting] = useAtom(gallerySettingAtom);
  const [isDragging, setIsDragging] = useState(false);
  const [previewValue, setPreviewValue] = useState<ColumnValue>(gallerySetting.columns);
  const [justFinishedDragging, setJustFinishedDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // 计算当前显示值
  const displayValue = useMemo((): ColumnValue => {
    return isDragging || justFinishedDragging ? previewValue : gallerySetting.columns;
  }, [isDragging, justFinishedDragging, previewValue, gallerySetting.columns]);

  // 计算滑块位置
  const position = useMemo(() => getPositionFromValue(displayValue), [displayValue]);

  // 状态更新函数
  const updateGallerySettings = useCallback(
    (newValue: ColumnValue) => {
      setGallerySetting((prev) => ({
        ...prev,
        columns: newValue,
      }));
    },
    [setGallerySetting],
  );

  // 防抖的更新函数
  const debouncedUpdate = useDebounce(updateGallerySettings, 150);

  // 监听全局状态同步
  useEffect(() => {
    if (justFinishedDragging && gallerySetting.columns === previewValue) {
      setJustFinishedDragging(false);
    }
  }, [gallerySetting.columns, previewValue, justFinishedDragging]);

  // 计算新值并更新预览
  const updatePreviewValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const positionPercent = ((clientX - rect.left) / rect.width) * 100;
      const clampedPosition = Math.max(0, Math.min(100, positionPercent));
      const newValue = getValueFromPosition(clampedPosition);

      if (newValue !== previewValue) {
        setPreviewValue(newValue);
        debouncedUpdate(newValue);
      }
    },
    [previewValue, debouncedUpdate],
  );

  // 拖动开始处理
  const handleDragStart = useCallback(
    (clientX: number) => {
      if (disabled) return;

      setPreviewValue(gallerySetting.columns);
      setIsDragging(true);
      updatePreviewValue(clientX);
    },
    [disabled, gallerySetting.columns, updatePreviewValue],
  );

  // 拖动结束处理
  const handleDragEnd = useCallback(() => {
    updateGallerySettings(previewValue);
    setIsDragging(false);
    setJustFinishedDragging(true);
  }, [previewValue, updateGallerySettings]);

  // 事件监听器清理
  const cleanupEventListeners = useCallback(() => {
    const cleanup = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handlePointerUp);
    };

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      updatePreviewValue(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        updatePreviewValue(e.touches[0].clientX);
      }
    };

    const handlePointerUp = () => {
      handleDragEnd();
      cleanup();
    };

    return { handlePointerMove, handleTouchMove, handlePointerUp, cleanup };
  }, [updatePreviewValue, handleDragEnd]);

  // 主要的指针事件处理器
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return;

      event.preventDefault();
      handleDragStart(event.clientX);

      const { handlePointerMove, handleTouchMove, handlePointerUp } = cleanupEventListeners();

      document.addEventListener('pointermove', handlePointerMove, { passive: false });
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handlePointerUp);
    },
    [disabled, handleDragStart, cleanupEventListeners],
  );

  // 触摸事件处理器
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        const pointerEvent = {
          clientX: touch.clientX,
          preventDefault: () => e.preventDefault(),
        } as React.PointerEvent;
        handlePointerDown(pointerEvent);
      }
    },
    [disabled, handlePointerDown],
  );

  // 渲染标签
  const renderLabels = () => (
    <div className="mb-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
      <span>{autoLabel}</span>
      <span>10 列</span>
    </div>
  );

  // 渲染刻度
  const renderScale = () => (
    <div className="absolute top-full mt-1 flex w-full text-xs text-gray-400 dark:text-gray-500">
      <div className="w-[15%] text-left">
        <span className={cn('transition-colors', displayValue === 'auto' && 'font-medium text-blue-500')}>{autoLabel}</span>
      </div>
      <div className="flex w-[85%] justify-between">
        {COLUMN_OPTIONS.filter((opt) => opt !== 'auto').map((num) => (
          <span key={num} className={cn('transition-colors', displayValue === num && 'text-primary font-medium')}>
            {num}
          </span>
        ))}
      </div>
    </div>
  );

  // 渲染滑块轨道
  const renderTrack = () => (
    <div ref={trackRef} className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-gray-200 dark:bg-gray-700">
      {/* 自动档区域指示 */}
      <div className="absolute top-0 left-0 h-full w-[12%] rounded-l-full bg-blue-100 dark:bg-blue-900/50" />

      {/* 激活区域 */}
      <div
        className={cn(
          'absolute top-0 h-full max-w-full rounded-full transition-all duration-150',
          displayValue === 'auto' ? 'bg-blue-500' : 'bg-primary',
        )}
        style={{
          width: `${Math.max(position, 5)}%`,
          borderRadius: displayValue === 'auto' ? '9999px 0 0 9999px' : '9999px',
        }}
      />
    </div>
  );

  // 渲染滑块把手
  const renderThumb = () => (
    <div
      className={cn(
        'absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg transition-all duration-150',
        isDragging ? 'scale-110' : 'hover:scale-105',
        displayValue === 'auto' ? 'bg-blue-500' : 'bg-primary',
        disabled && 'cursor-not-allowed',
      )}
      style={{
        left: `${position}%`,
      }}
    />
  );

  // 渲染当前值显示
  const renderCurrentValue = () => (
    <div className="mt-8 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
      {displayValue === 'auto' ? autoLabel : `${displayValue} 列`}
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      {renderLabels()}

      {/* 滑块容器 */}
      <div
        ref={sliderRef}
        className={cn('relative h-6 cursor-pointer touch-none', disabled && 'cursor-not-allowed opacity-50')}
        onPointerDown={handlePointerDown}
        onTouchStart={handleTouchStart}
      >
        {renderTrack()}
        {renderThumb()}
        {renderScale()}
      </div>

      {renderCurrentValue()}
    </div>
  );
};
