import { routers } from '@/constants/router';
import { useMemo } from 'react';
import { AiFillGithub } from 'react-icons/ai';
import { CgDarkMode } from 'react-icons/cg';
import { useToggleTheme } from './useToggleTheme';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useNavItems = () => {
  const toggleTheme = useToggleTheme();
  const buttons = useMemo(
    () => [
      {
        key: 'Github',
        icon: <AiFillGithub className="h-9 w-9 cursor-pointer" />,
        onClick: () => window?.open('https://github.com/yusixian/tabby-nav', '_blank'),
      },
      {
        key: 'CgDarkMode',
        icon: <CgDarkMode className="h-9 w-9 cursor-pointer" />,
        onClick: toggleTheme,
      },
    ],
    [toggleTheme],
  );
  return { routers, buttons };
};

export const useFetchImageList = () => {
  return useInfiniteQuery(
    ['fetch_image_list'],
    async ({ pageParam = 0 }) => {
      const res = await fetch(`/api/list?page=${page}&pageSize=${pageSize}`);
      return res?.data;
    },
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage?.length === 20) {
          return pages.length;
        } else {
          return false;
        }
      },
      onSuccess: (data) => {
        setPremiumList(data);
      },
    },
  );
};
