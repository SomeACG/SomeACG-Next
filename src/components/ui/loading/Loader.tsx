/** https://uiverse.io/TemRevil/little-duck-0 */
import { cn } from '@/lib/utils';
import React from 'react';

export default function Loader({ className }: { className?: string }) {
  return (
    <div className={cn('flex-center', className)}>
      <div className="loader" />
    </div>
  );
}
