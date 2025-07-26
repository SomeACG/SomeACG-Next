import { useAtomValue } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { gallerySettingAtom } from '@/store/app';

const COLUMN_WIDTH_CONFIG = {
  auto: {
    mobile: 150,
    desktop: 250,
    maxColumns: 8,
  },
  min: {
    mobile: 120,
    desktop: 200,
  },
  max: {
    mobile: 250,
    desktop: 500,
  },
};



// Simplified container size hook using ResizeObserver
function useContainerWidth() {
  const [width, setWidth] = useState(0);
  
  const ref = useCallback((element: HTMLElement | null) => {
    if (!element) {
      setWidth(0);
      return;
    }
    
    // Set initial width
    setWidth(element.clientWidth);
    
    // Create ResizeObserver
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });
    
    observer.observe(element);
    
    // Cleanup
    return () => observer.disconnect();
  }, []);
  
  return [width, ref] as const;
}

export function useDynamicColumnWidth() {
  const { columns } = useAtomValue(gallerySettingAtom);
  const [containerWidth, setContainer] = useContainerWidth();
  const isMobile = useMediaQuery({ maxWidth: 767 });


  // 动态计算列宽和列数（确保填满容器）
  const { columnWidth, columnCount } = useMemo(() => {
    if (!containerWidth || containerWidth === 0) {
      return { columnWidth: 150, columnCount: 2 };
    }

    const { auto, min, max } = COLUMN_WIDTH_CONFIG;
    const gutter = 4; // 列间距
    // 当使用实际容器宽度时，不需要减去 padding，因为 clientWidth 已经是内容区域宽度
    const availableWidth = containerWidth;

    if (columns === 'auto') {
      const autoWidth = isMobile ? auto.mobile : auto.desktop;
      let colCount;

      if (!isMobile) {
        const { maxColumns } = auto;
        // 计算能容纳的列数
        colCount = Math.floor((availableWidth + gutter) / (autoWidth + gutter));
        colCount = Math.max(1, Math.min(colCount, maxColumns));
      } else {
        // 移动端
        colCount = Math.floor((availableWidth + gutter) / (autoWidth + gutter));
        colCount = Math.max(1, Math.min(colCount, 4)); // 移动端最多4列
      }

      // 根据实际列数计算列宽，确保填满容器
      const colWidth = (availableWidth - (colCount - 1) * gutter) / colCount;
      return { columnWidth: colWidth, columnCount: colCount };
    }

    // 自定义列数模式：直接根据容器宽度和列数计算列宽，确保填满容器
    const calculatedWidth = (availableWidth - (columns - 1) * gutter) / columns;

    // 检查是否超出最小最大限制
    const minWidth = isMobile ? min.mobile : min.desktop;
    const maxWidth = isMobile ? max.mobile : max.desktop;

    if (calculatedWidth < minWidth) {
      // 如果计算出的宽度太小，减少列数
      const maxCols = Math.floor((availableWidth + gutter) / (minWidth + gutter));
      const adjustedColumns = Math.max(1, Math.min(columns, maxCols));
      const adjustedWidth = (availableWidth - (adjustedColumns - 1) * gutter) / adjustedColumns;
      return { columnWidth: adjustedWidth, columnCount: adjustedColumns };
    }

    if (calculatedWidth > maxWidth) {
      // 如果计算出的宽度太大，增加列数
      const minCols = Math.ceil((availableWidth + gutter) / (maxWidth + gutter));
      const adjustedColumns = Math.max(columns, minCols);
      const adjustedWidth = (availableWidth - (adjustedColumns - 1) * gutter) / adjustedColumns;
      return { columnWidth: adjustedWidth, columnCount: adjustedColumns };
    }

    // 在合理范围内，直接使用计算出的宽度，确保填满容器
    return { columnWidth: calculatedWidth, columnCount: columns };
  }, [isMobile, columns, containerWidth]);

  return {
    columnWidth,
    columnCount,
    containerWidth,
    isMobile,
    setContainer,
  };
}
