'use client';

import { Button } from '@/components/ui/button';
import { ColumnSlider } from '@/components/ui/ColumnSlider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { viewModeAtom } from '@/store/app';
import { useAtom } from 'jotai';
import { ColumnsIcon, ViewIcon, Settings } from 'lucide-react';
import { useCallback } from 'react';
import { CompactPagination } from './CompactPagination';

interface ImageControlsProps {
  showColumnSlider?: boolean;
}

export function ImageControls({ showColumnSlider = false }: ImageControlsProps) {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);

  const toggleViewMode = useCallback(() => {
    setViewMode(viewMode === 'pagination' ? 'infinite' : 'pagination');
  }, [viewMode, setViewMode]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
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

        {viewMode === 'pagination' && <CompactPagination />}
      </div>

      {showColumnSlider && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Settings className="h-3.5 w-3.5" />
              列数设置
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">列数设置</h4>
                <p className="text-sm text-muted-foreground">
                  调整图片网格的列数
                </p>
              </div>
              <ColumnSlider min={2} max={8} />
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
