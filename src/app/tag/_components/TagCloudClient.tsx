'use client';

import Loader from '@/components/ui/loading/Loader';
import Link from 'next/link';
import { FaTags } from 'react-icons/fa';
import { FaShuffle, FaArrowDownShortWide, FaArrowUpWideShort, FaRotateLeft } from 'react-icons/fa6';
import useSWR from 'swr';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Tag {
  tag: string;
  count: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getRandomTags = (tags: Tag[], count: number = 50): Tag[] => {
  const shuffled = [...tags].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const getSortedTags = (tags: Tag[], ascending: boolean): Tag[] => {
  return [...tags].sort((a, b) => (ascending ? a.count - b.count : b.count - a.count));
};

export default function TagCloudClient() {
  const { data: tags, error, isLoading } = useSWR<Tag[]>('/api/tags', fetcher);
  const [displayTags, setDisplayTags] = useState<Tag[] | null>(null);

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">加载失败，请刷新重试</div>;
  }

  if (isLoading) {
    return <Loader className="mt-8" />;
  }

  const handleRandomize = () => {
    if (tags) {
      setDisplayTags(getRandomTags(tags));
    }
  };

  const handleReset = () => {
    setDisplayTags(null);
  };

  const handleSort = (ascending: boolean) => {
    if (tags) {
      setDisplayTags(getSortedTags(tags, ascending));
    }
  };

  const tagsToShow = displayTags || tags;

  return (
    <div className="container mx-auto min-h-[50vh] px-2 py-6 sm:px-4 sm:py-8">
      <div className="mb-4 flex flex-wrap justify-center gap-1.5 sm:mb-6 sm:gap-3">
        <Button
          onClick={handleRandomize}
          variant="outline"
          size="sm"
          className="rounded-full border-2 border-pink-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-pink-500 transition-all duration-300 hover:scale-105 hover:border-pink-300 hover:bg-pink-50/80 hover:text-pink-600 hover:shadow-lg sm:px-4 sm:py-2 sm:text-sm dark:border-pink-800 dark:bg-gray-900 dark:text-pink-400 dark:hover:border-pink-700 dark:hover:bg-pink-950"
        >
          <FaShuffle className="mr-1.5 text-base transition-transform duration-300 group-hover:rotate-180 sm:mr-2 sm:text-lg" />
          <span>随机显示</span>
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="rounded-full border-2 border-purple-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-purple-500 transition-all duration-300 hover:scale-105 hover:border-purple-300 hover:bg-purple-50/80 hover:text-purple-600 hover:shadow-lg sm:px-4 sm:py-2 sm:text-sm dark:border-purple-800 dark:bg-gray-900 dark:text-purple-400 dark:hover:border-purple-700 dark:hover:bg-purple-950"
        >
          <FaRotateLeft className="mr-1.5 text-base transition-transform duration-300 group-hover:-rotate-180 sm:mr-2 sm:text-lg" />
          <span>还原</span>
        </Button>
        <Button
          onClick={() => handleSort(true)}
          variant="outline"
          size="sm"
          className="rounded-full border-2 border-blue-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-blue-500 transition-all duration-300 hover:scale-105 hover:border-blue-300 hover:bg-blue-50/80 hover:text-blue-600 hover:shadow-lg sm:px-4 sm:py-2 sm:text-sm dark:border-blue-800 dark:bg-gray-900 dark:text-blue-400 dark:hover:border-blue-700 dark:hover:bg-blue-950"
        >
          <FaArrowUpWideShort className="mr-1.5 text-base transition-transform duration-300 group-hover:-translate-y-1 sm:mr-2 sm:text-lg" />
          <span>升序</span>
        </Button>
        <Button
          onClick={() => handleSort(false)}
          variant="outline"
          size="sm"
          className="rounded-full border-2 border-teal-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-teal-500 transition-all duration-300 hover:scale-105 hover:border-teal-300 hover:bg-teal-50/80 hover:text-teal-600 hover:shadow-lg sm:px-4 sm:py-2 sm:text-sm dark:border-teal-800 dark:bg-gray-900 dark:text-teal-400 dark:hover:border-teal-700 dark:hover:bg-teal-950"
        >
          <FaArrowDownShortWide className="mr-1.5 text-base transition-transform duration-300 group-hover:translate-y-1 sm:mr-2 sm:text-lg" />
          <span>降序</span>
        </Button>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-1.5 sm:gap-4">
        {tagsToShow?.map((tag: Tag) => (
          <div key={tag.tag} className="group relative">
            <Link
              href={`/tag/${encodeURIComponent(tag.tag)}`}
              className="border-primary/30 hover:border-primary/50 dark:border-primary/60 dark:hover:border-primary relative flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:gap-3 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              <FaTags className="text-primary text-[0.7rem] transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 sm:text-sm" />
              <span className="group-hover:text-primary dark:group-hover:text-primary font-medium tracking-wide text-gray-800 transition-all duration-300 dark:text-gray-300">
                {tag.tag}
              </span>
              <span className="bg-primary/10 text-primary group-hover:bg-primary/20 ml-0.5 inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[10px] font-medium transition-all duration-300 sm:ml-1 sm:h-5 sm:min-w-[20px] sm:px-2 sm:text-xs">
                {tag.count}
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
