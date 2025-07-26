import { DarkThemeIcon } from '@/components/ui/icons/DarkThemeIcon';
import { GithubIcon } from '@/components/ui/icons/GithubIcon';
import { RssIcon } from '@/components/ui/icons/RssIcon';
import { routers } from '@/constants/router';
import { useMemo } from 'react';
import { useToggleTheme } from './useToggleTheme';

export const useNavItems = () => {
  const toggleTheme = useToggleTheme();
  const buttons = useMemo(
    () => [
      {
        key: 'RSS',
        icon: <RssIcon className="size-6 cursor-pointer" />,
        onClick: () => window?.open('/rss.xml', '_blank'),
      },
      {
        key: 'Github',
        icon: <GithubIcon className="size-8 cursor-pointer" />,
        onClick: () => window?.open('https://github.com/SomeACG/SomeACG-Next', '_blank'),
      },
      {
        key: 'CgDarkMode',
        icon: <DarkThemeIcon className="size-8 cursor-pointer" />,
        onClick: toggleTheme,
      },
    ],
    [toggleTheme],
  );
  return { routers, buttons };
};
