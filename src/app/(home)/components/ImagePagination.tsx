import { Button } from '@/components/ui/button';
import { pageAtom, totalPageAtom } from '@/store/app';
import { useAtom, useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6';

export default function ImagePagination() {
  const [page, setPage] = useAtom(pageAtom);
  const totalPage = useAtomValue(totalPageAtom);
  const [inputPage, setInputPage] = useState('1');

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputPage(value);
    }
  };

  const handlePageInputBlur = () => {
    let newPage = parseInt(inputPage);
    if (isNaN(newPage) || newPage < 1) {
      newPage = 1;
    } else if (newPage > totalPage) {
      newPage = totalPage;
    }
    setInputPage(newPage.toString());
    setPage(newPage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageInputBlur();
    }
  };

  return (
    <div className="flex items-center justify-between px-2 pt-2">
      <div className="flex items-center gap-2">
        <Button
          className="flex-center rounded-full p-3"
          onClick={() => {
            setPage(1);
            setInputPage('1');
          }}
          disabled={page === 1}
        >
          <FaAnglesLeft className="h-4 w-4" />
        </Button>
        <Button
          className="px-3 py-2"
          onClick={() => {
            const newPage = page - 1;
            setPage(newPage);
            setInputPage(newPage.toString());
          }}
          disabled={page === 1}
        >
          上一页
        </Button>
      </div>
      <div className="flex items-center gap-2 text-base">
        第
        <input
          type="text"
          value={inputPage}
          onChange={handlePageInputChange}
          onBlur={handlePageInputBlur}
          onKeyDown={handleKeyDown}
          className="w-12 rounded border border-gray-300 px-2 py-1 text-center dark:border-gray-600 dark:bg-gray-700"
        />
        / {totalPage} 页
      </div>
      <div className="flex items-center gap-2 px-2">
        <Button
          className="px-3 py-2"
          onClick={() => {
            const newPage = page + 1;
            setPage(newPage);
            setInputPage(newPage.toString());
          }}
          disabled={page === totalPage}
        >
          下一页
        </Button>
        <Button
          className="flex-center rounded-full p-3"
          onClick={() => {
            setPage(totalPage);
            setInputPage(totalPage.toString());
          }}
          disabled={page === totalPage}
        >
          <FaAnglesRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
