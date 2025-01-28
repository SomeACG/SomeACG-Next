import { delayOpenAnimVariants } from '@/lib/anim';
import { cn } from '@/lib/utils';
import { ClassValue } from 'clsx';
import { motion } from 'framer-motion';

export type NavItemProps = {
  selected?: boolean;
  name?: string;
  icon?: JSX.Element;
  onClick?: () => void;
  className?: ClassValue;
  indicatorClass?: string;
  type?: 'header' | 'sider';
  layoutIdPrefix?: string;
};
function NavItem({
  selected,
  icon,
  name,
  onClick,
  className,
  indicatorClass,
  type = 'header',
  layoutIdPrefix = 'header',
}: NavItemProps) {
  return (
    <motion.div variants={delayOpenAnimVariants}>
      <div
        className={cn(
          'relative flex h-full w-full cursor-pointer items-center justify-center text-base',
          {
            'text-white': selected && type !== 'header',
            'text-primary': selected && type === 'header',
            'z-0': type === 'sider',
            'after:absolute after:bottom-0.5 after:left-1/2 after:z-10 after:block after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-foreground after:transition-all after:duration-300 hover:after:w-[calc(100%_-_0.5rem)]':
              !selected && type === 'header',
          },
          className,
        )}
        onClick={onClick}
      >
        {icon}
        {name}
        {selected && (
          <motion.div
            className={cn(
              'absolute inset-x-1 bottom-0.5 border-t-2 border-primary',
              {
                'bg-gradient-pink inset-0 -z-10 rounded-lg border-none': type === 'sider',
              },
              indicatorClass,
            )}
            layoutId={`${layoutIdPrefix ?? 'header'}_tab_selected`}
          />
        )}
      </div>
    </motion.div>
  );
}
export default NavItem;
