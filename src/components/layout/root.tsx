'use client';

import { fontVariants } from '@/constants/font';
import clsx from 'clsx';
import { Footer } from './footer';
import { Header } from './header';

export default function Root({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className={clsx('dark:bg-gradient-dark bg-gradient flex flex-col text-black dark:text-white', ...fontVariants)}>
      <Header />
      <main className="relative min-h-screen">{children}</main>
      <Footer />
    </div>
  );
}
