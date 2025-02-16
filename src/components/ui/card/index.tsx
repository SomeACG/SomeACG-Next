import clsx from 'clsx';
import { MouseEventHandler, ReactNode, useCallback } from 'react';

type CardProps = {
  title?: string;
  desc?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  href?: string;
  clickable?: boolean;

  className?: string;
};

const Card = ({ title, desc, children, onClick, href, className, clickable = false }: CardProps) => {
  const _clickable = clickable ?? (href || onClick);
  const _onClick: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      href && window?.open(href, '_blank');
      onClick?.(e);
    },
    [href, onClick],
  );

  return (
    <div
      onClick={_onClick}
      className={clsx(
        'group relative flex flex-col gap-2 rounded-xl border p-4 backdrop-blur-sm',
        'border-gray-200 bg-white/80 dark:border-gray-700/50 dark:bg-gray-900/50',
        {
          'cursor-pointer transition-all duration-300 hover:-translate-y-1': _clickable,
          'hover:border-gray-300 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 dark:hover:border-gray-600 dark:hover:shadow-purple-500/10':
            _clickable,
        },
        className,
      )}
    >
      {/* 背景光效 */}
      <div className="absolute inset-0 -z-10 h-full w-full rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-purple-500/5 dark:to-blue-500/5" />

      {title && (
        <h2 className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-lg font-bold text-transparent transition-colors duration-300 group-hover:from-gray-800 group-hover:to-black dark:from-purple-200 dark:to-blue-200 dark:group-hover:from-purple-300 dark:group-hover:to-blue-300">
          {title}
        </h2>
      )}
      {desc && (
        <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700 dark:text-gray-400/90 dark:group-hover:text-gray-300/90">
          {desc}
        </p>
      )}
      {children}

      {/* 装饰性元素 - 更微妙的光晕效果 */}
      <div className="absolute -inset-0.5 -z-10 rounded-xl bg-gradient-to-r opacity-0 blur transition-all duration-300 group-hover:opacity-100 dark:from-purple-500/10 dark:via-purple-500/5 dark:to-blue-500/10" />
    </div>
  );
};
export default Card;
