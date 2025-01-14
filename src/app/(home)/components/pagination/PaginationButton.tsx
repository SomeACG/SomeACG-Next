import { Button } from '@/components/ui/button';
import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface PaginationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

export function PaginationButton({ active, className, children, ...props }: PaginationButtonProps) {
  return (
    <Button variant="ghost" size="sm" className={cn('h-7 w-7 p-0', active && 'font-medium text-primary', className)} {...props}>
      {children}
    </Button>
  );
}
