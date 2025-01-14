import { Button } from '@/components/ui/button';
import { pageAtom, totalPageAtom } from '@/store/app';
import { useAtom, useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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

  const renderPageNumbers = () => {
    const items = [];

    // 始终显示第一页
    if (page !== 1 && page - 1 !== 1) {
      items.push(
        <Button
          key="first"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => {
            setPage(1);
            setInputPage('1');
          }}
        >
          1
        </Button>,
      );
    }

    // 显示省略号
    if (page > 3) {
      items.push(
        <React.Fragment key="dots1">
          <span className="mx-1 opacity-50">...</span>
        </React.Fragment>,
      );
    }

    // 显示当前页前一页
    if (page !== 1) {
      items.push(
        <Button
          key="prev-num"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => {
            setPage(page - 1);
            setInputPage((page - 1).toString());
          }}
        >
          {page - 1}
        </Button>,
      );
    }

    // 显示当前页
    items.push(
      <Button key="current" variant="ghost" size="sm" className="h-7 w-7 bg-accent p-0 font-medium">
        {page}
      </Button>,
    );

    // 显示当前页后一页
    if (page !== totalPage) {
      items.push(
        <Button
          key="next-num"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => {
            setPage(page + 1);
            setInputPage((page + 1).toString());
          }}
        >
          {page + 1}
        </Button>,
      );
    }

    // 显示省略号
    if (page < totalPage - 2) {
      items.push(
        <React.Fragment key="dots2">
          <span className="mx-1 opacity-50">...</span>
        </React.Fragment>,
      );
    }

    // 始终显示最后一页
    if (page !== totalPage && page + 1 !== totalPage) {
      items.push(
        <Button
          key="last"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => {
            setPage(totalPage);
            setInputPage(totalPage.toString());
          }}
        >
          {totalPage}
        </Button>,
      );
    }

    return items;
  };

  return (
    <div className="flex items-center justify-between px-2 py-1 @container">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <input
          type="text"
          value={inputPage}
          onChange={handlePageInputChange}
          onBlur={handlePageInputBlur}
          onKeyDown={handleKeyDown}
          className="h-7 w-12 rounded border border-primary bg-primary/20 px-1 text-center text-sm text-foreground transition-colors focus:outline-primary"
        />
        <span className="opacity-50">/ {totalPage}</span>
      </div>
      <div className="hidden items-center justify-center gap-1 text-xs text-muted-foreground @lg:flex">
        关注
        <a className="text-blue-400 hover:underline" href="https://t.me/CosineGallery">
          Cosine 🎨 Gallery
        </a>
        每天看甜妹！
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => {
            const newPage = page - 1;
            setPage(newPage);
            setInputPage(newPage.toString());
          }}
          disabled={page === 1}
        >
          <FaChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {renderPageNumbers()}

        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => {
            const newPage = page + 1;
            setPage(newPage);
            setInputPage(newPage.toString());
          }}
          disabled={page === totalPage}
        >
          <FaChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
