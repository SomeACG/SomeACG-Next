'use client';

import { Button } from '@/components/ui/button';
import { ColumnSlider } from '@/components/ui/ColumnSlider';
import { viewModeAtom } from '@/store/app';
import { useAtom } from 'jotai';
import { ColumnsIcon, ViewIcon, Settings } from 'lucide-react';
import { useCallback, useState } from 'react';

interface ImageControlsProps {
  showColumnSlider?: boolean;
}

export function ImageControls({ showColumnSlider = false }: ImageControlsProps) {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  const toggleViewMode = useCallback(() => {
    setViewMode(viewMode === 'pagination' ? 'infinite' : 'pagination');
  }, [viewMode, setViewMode]);

  const toggleColumnSettings = useCallback(() => {
    setShowColumnSettings((prev) => !prev);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleViewMode} className="h-8 gap-2 text-xs font-medium">
            {viewMode === 'pagination' ? (
              <>
                <ViewIcon className="h-3.5 w-3.5" />
                分页模式
              </>
            ) : (
              <>
                <ColumnsIcon className="h-3.5 w-3.5" />
                无限滚动
              </>
            )}
          </Button>
        </div>

        {showColumnSlider && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleColumnSettings}
            className="h-8 gap-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Settings className="h-3.5 w-3.5" />
            列数设置
          </Button>
        )}
      </div>

      {showColumnSlider && showColumnSettings && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <ColumnSlider min={2} max={8} />
        </div>
      )}
    </div>
  );
}
