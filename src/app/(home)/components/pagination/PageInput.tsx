import React, { useState, useEffect } from 'react';

interface PageInputProps {
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}

export function PageInput({ currentPage, totalPage, onPageChange }: PageInputProps) {
  const [inputPage, setInputPage] = useState(currentPage.toString());

  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

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
    onPageChange(newPage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageInputBlur();
    }
  };

  return (
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
  );
}
