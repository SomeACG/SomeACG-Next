'use client';

import { Button } from '@/components/ui/button';
import { pageAtom, totalPageAtom } from '@/store/app';
import { useAtom, useAtomValue } from 'jotai';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';

export function CompactPagination() {
  const [page, setPage] = useAtom(pageAtom);
  const totalPage = useAtomValue(totalPageAtom);
  const [inputPage, setInputPage] = useState(page.toString());

  useEffect(() => {
    setInputPage(page.toString());
  }, [page]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPage) {
        setPage(newPage);
      }
    },
    [setPage, totalPage],
  );

  const handlePrevious = useCallback(() => {
    handlePageChange(page - 1);
  }, [handlePageChange, page]);

  const handleNext = useCallback(() => {
    handlePageChange(page + 1);
  }, [handlePageChange, page]);

  const handlePageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputPage(value);
    }
  }, []);

  const handlePageInputBlur = useCallback(() => {
    let newPage = parseInt(inputPage);
    if (isNaN(newPage) || newPage < 1) {
      newPage = 1;
    } else if (newPage > totalPage) {
      newPage = totalPage;
    }
    setInputPage(newPage.toString());
    handlePageChange(newPage);
  }, [inputPage, totalPage, handlePageChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handlePageInputBlur();
      }
    },
    [handlePageInputBlur],
  );

  if (totalPage <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={inputPage}
          onChange={handlePageInputChange}
          onBlur={handlePageInputBlur}
          onKeyDown={handleKeyDown}
          className="h-7 w-10 rounded border border-gray-300 bg-white/80 px-1 text-center text-xs text-gray-900 transition-colors focus:border-blue-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-100 dark:focus:border-blue-400"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">/ {totalPage}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={handlePrevious} disabled={page === 1} className="h-7 w-7 p-0">
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <Button variant="ghost" size="sm" onClick={handleNext} disabled={page === totalPage} className="h-7 w-7 p-0">
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
