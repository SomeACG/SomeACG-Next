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
    <div className="space-y-8 px-8 py-4 md:px-4">
      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchClient initialParams={searchParams} />
      </Suspense>
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* 搜索区域容器骨架 */}
      <div className="container mx-auto max-w-4xl px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* 搜索框骨架 */}
          <div className="h-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          
          {/* 过滤器骨架 */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </div>

        {/* 结果统计栏骨架 */}
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <div className="flex items-center space-x-4">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      {/* 搜索结果区域骨架 */}
      <div className="space-y-6">
        {/* 控制栏骨架 */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* 瀑布流网格骨架 */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
              style={{
                aspectRatio: Math.random() > 0.5 ? '3/4' : '4/3',
                height: `${200 + Math.random() * 150}px`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
