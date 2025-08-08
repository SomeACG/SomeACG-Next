import { Metadata } from 'next';
import { Suspense } from 'react';
import SearchClient from './_components/SearchClient';

export const metadata: Metadata = {
  title: '搜索 - SomeACG',
  description: '搜索图片、标签、画师',
};

interface SearchPageProps {
  searchParams: {
    q?: string;
    platform?: string;
    tags?: string;
    r18?: string;
    sort?: string;
    page?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchClient initialParams={searchParams} />
      </Suspense>
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* 搜索框骨架 */}
      <div className="mx-auto w-full max-w-2xl">
        <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* 过滤器骨架 */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>

      {/* 结果网格骨架 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </div>
  );
}
