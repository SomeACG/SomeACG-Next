import { useWindowSize } from 'react-use';
import { useCallback, useMemo } from 'react';

interface ColumnConfig {
  width: number;
  gutter: number;
}

export function useColumnConfig() {
  const { width } = useWindowSize();

  const getColumnConfig = useCallback((): ColumnConfig => {
    if (width < 640) {
      return { width: Math.min(150, width - 32), gutter: 8 };
    } else if (width < 768) {
      return { width: Math.min(200, width / 2 - 32), gutter: 12 };
    } else {
      return { width: Math.min(250, width / 3 - 64), gutter: 16 };
    }
  }, [width]);

  const columnConfig = useMemo(() => getColumnConfig(), [getColumnConfig]);

  return columnConfig;
}
