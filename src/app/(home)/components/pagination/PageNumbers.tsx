import React from 'react';
import { PaginationButton } from './PaginationButton';

interface PageNumbersProps {
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}

export function PageNumbers({ currentPage, totalPage, onPageChange }: PageNumbersProps) {
  const items = [];

  // 始终显示第一页
  if (currentPage !== 1 && currentPage - 1 !== 1) {
    items.push(
      <PaginationButton key="first" onClick={() => onPageChange(1)}>
        1
      </PaginationButton>,
    );
  }

  // 显示省略号
  if (currentPage > 3) {
    items.push(
      <React.Fragment key="dots1">
        <span className="mx-1 opacity-50">...</span>
      </React.Fragment>,
    );
  }

  // 显示当前页前一页
  if (currentPage !== 1) {
    items.push(
      <PaginationButton key="prev-num" onClick={() => onPageChange(currentPage - 1)}>
        {currentPage - 1}
      </PaginationButton>,
    );
  }

  // 显示当前页
  items.push(
    <PaginationButton key="current" disabled active>
      {currentPage}
    </PaginationButton>,
  );

  // 显示当前页后一页
  if (currentPage !== totalPage) {
    items.push(
      <PaginationButton key="next-num" onClick={() => onPageChange(currentPage + 1)}>
        {currentPage + 1}
      </PaginationButton>,
    );
  }

  // 显示省略号
  if (currentPage < totalPage - 2) {
    items.push(
      <React.Fragment key="dots2">
        <span className="mx-1 opacity-50">...</span>
      </React.Fragment>,
    );
  }

  // 始终显示最后一页
  if (currentPage !== totalPage && currentPage + 1 !== totalPage) {
    items.push(
      <PaginationButton key="last" onClick={() => onPageChange(totalPage)}>
        {totalPage}
      </PaginationButton>,
    );
  }

  return <div className="flex items-center gap-1">{items}</div>;
}
