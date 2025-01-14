import { routers } from '@/constants/router';
import { useMemo } from 'react';
import { AiFillGithub } from 'react-icons/ai';
import { CgDarkMode } from 'react-icons/cg';
import { useToggleTheme } from './useToggleTheme';
import { ColumnsIcon, ViewIcon } from 'lucide-react';
import { viewModeAtom } from '@/store/app';
import { useAtom } from 'jotai';

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
        key: 'Github',
        icon: <AiFillGithub className="h-8 w-8 cursor-pointer" />,
        onClick: () => window?.open('https://github.com/yusixian/SomeACG-Next', '_blank'),
      },
      {
        key: 'CgDarkMode',
        icon: <CgDarkMode className="h-8 w-8 cursor-pointer" />,
        onClick: toggleTheme,
      },
    ],
    [toggleTheme, viewMode],
  );
  return { routers, buttons };
};
