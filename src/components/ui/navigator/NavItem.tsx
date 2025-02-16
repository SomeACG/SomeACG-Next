import { delayOpenAnimVariants } from '@/lib/anim';
import { cn } from '@/lib/utils';
import { ClassValue } from 'clsx';
import { motion } from 'motion/react';

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
    <motion.div
      variants={delayOpenAnimVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <div
        className={cn(
          'relative flex h-full w-full cursor-pointer items-center justify-center text-base',
          {
            'text-white': selected && type !== 'header',
            'text-primary': selected && type === 'header',
            'z-0': type === 'sider',
            'after:bg-foreground after:absolute after:bottom-0 after:left-1/2 after:z-10 after:block after:h-[2px] after:w-0 after:-translate-x-1/2 after:opacity-0 after:transition-all after:duration-300 hover:after:w-[calc(100%_-_0.5rem)] hover:after:opacity-100':
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
              'border-primary absolute inset-x-1 bottom-0 border-t-2',
              {
                'bg-gradient-pink inset-0 -z-10 rounded-lg border-none': type === 'sider',
              },
              indicatorClass,
            )}
            layoutId={`${layoutIdPrefix ?? 'header'}_tab_selected`}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
export default NavItem;
