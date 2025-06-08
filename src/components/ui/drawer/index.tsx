import { fontVariants } from '@/constants/font';
import { cn } from '@/lib/utils';
import {
  FloatingFocusManager,
  FloatingNode,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'motion/react';
import React, { PropsWithChildren, cloneElement, useEffect, useState } from 'react';

export type Position = 'top' | 'bottom' | 'left' | 'right';
type DrawerProps = {
  open?: boolean;
  title?: React.ReactNode;
  zIndex?: 0 | 20 | 30 | 40 | 50;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onExitComplete?: () => void;
  render: (props: { close: () => void }) => React.ReactNode;
  children?: JSX.Element;
  className?: string;
  scroll?: boolean;
  renderHeader?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  position?: Position;
  triggerRef?: React.RefObject<HTMLElement>;
};
const posClass: { [key in Position]: string } = {
  top: '',
  bottom: '',
  left: 'inset-y-0 left-0 rounded-tr-xl rounded-br-xl',
  right: '',
};
function Drawer({
  render,
  open: passedOpen = false,
  title,
  children,
  onOpenChange,
  onExitComplete,
  onClose: prevOnClose,
  className,
  renderHeader,
  renderFooter,
  zIndex = 30,
  scroll = true,
  position = 'left',
  triggerRef,
}: PropsWithChildren<DrawerProps>) {
  const [open, setOpen] = useState(false);

  const nodeId = useFloatingNodeId();

  const onClose = (value: boolean) => {
    setOpen(value);
    prevOnClose?.();
    onOpenChange?.(value);
  };

  const {
    refs: { setFloating, setReference },
    context,
  } = useFloating({
    open,
    nodeId,
    onOpenChange: onClose,
  });

  const dismiss = useDismiss(context, {
    escapeKey: true,
    outsidePress: (event) => {
      if (!triggerRef?.current) return true;
      return !event.composedPath().includes(triggerRef.current);
    },
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([useClick(context), useRole(context), dismiss]);

  useEffect(() => {
    if (passedOpen === undefined) return;
    setOpen(passedOpen);
  }, [passedOpen]);

  return (
    <FloatingNode id={nodeId}>
      {children && cloneElement(children, getReferenceProps({ ref: setReference, ...children.props }))}
      <FloatingPortal>
        <AnimatePresence onExitComplete={onExitComplete}>
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <FloatingOverlay className="relative bg-black/30 backdrop-blur-xs" style={{ zIndex }}>
                <FloatingFocusManager context={context}>
                  <motion.div
                    className={cn(
                      'absolute flex min-w-[10rem] flex-col bg-white p-0 md:min-w-[5rem] dark:bg-[#1e1e1e]',
                      posClass[position || 'left'],
                      fontVariants,
                      className,
                    )}
                    initial={{ opacity: 0, translateX: -10 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    exit={{ opacity: 0, translateX: -10 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    {...getFloatingProps({ ref: setFloating })}
                  >
                    {title || renderHeader ? (
                      <header className="px-6 pt-6">
                        {!title && (
                          <div className="relative h-auto px-6 text-center text-xl leading-[22px] font-medium">{title}</div>
                        )}
                        {renderHeader?.()}
                      </header>
                    ) : null}
                    <main
                      className={cn('h-full', {
                        'overflow-auto': scroll,
                      })}
                    >
                      {render({ close: () => onClose(false) })}
                    </main>
                    {renderFooter && (
                      <footer className="absolute right-0 bottom-0 left-0 rounded-b-[10px] px-6 py-6 backdrop-blur-xl">
                        {renderFooter?.()}
                      </footer>
                    )}
                  </motion.div>
                </FloatingFocusManager>
              </FloatingOverlay>
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </FloatingNode>
  );
}

export default React.memo(Drawer);
