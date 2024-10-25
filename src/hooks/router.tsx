import { routers } from '@/constants/router';
import { useMemo } from 'react';
import { AiFillGithub } from 'react-icons/ai';
import { CgDarkMode } from 'react-icons/cg';
import { useToggleTheme } from './useToggleTheme';

export const useNavItems = () => {
  const toggleTheme = useToggleTheme();
  const buttons = useMemo(
    () => [
      {
        key: 'Github',
        icon: <AiFillGithub className="h-8 w-8 cursor-pointer" />,
        onClick: () => window?.open('https://github.com/cosZone/cos-space', '_blank'),
      },
      {
        key: 'CgDarkMode',
        icon: <CgDarkMode className="h-8 w-8 cursor-pointer" />,
        onClick: toggleTheme,
      },
    ],
    [toggleTheme],
  );
  return { routers, buttons };
};
