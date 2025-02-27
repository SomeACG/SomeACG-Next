import { DarkThemeIcon } from '@/components/ui/icons/DarkThemeIcon';
import { GithubIcon } from '@/components/ui/icons/GithubIcon';
import { RssIcon } from '@/components/ui/icons/RssIcon';
import { routers } from '@/constants/router';
import { viewModeAtom } from '@/store/app';
import { useAtom } from 'jotai';
import { ColumnsIcon, ViewIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useToggleTheme } from './useToggleTheme';

export const useNavItems = () => {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);

  const toggleTheme = useToggleTheme();
  const buttons = useMemo(
    () => [
      {
        key: 'ToggleViewMode',
        icon:
          viewMode === 'pagination' ? (
            <>
              <ViewIcon className="h-5 w-5" />
              <span className="text-sm">切换到无限滚动</span>
            </>
          ) : (
            <>
              <ColumnsIcon className="h-5 w-5" />
              <span className="text-sm">切换到分页模式</span>
            </>
          ),
        onClick: () => setViewMode(viewMode === 'pagination' ? 'infinite' : 'pagination'),
      },
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
    [setViewMode, toggleTheme, viewMode],
  );
  return { routers, buttons };
};
