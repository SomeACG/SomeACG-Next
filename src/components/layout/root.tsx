'use client';

import { fontVariants } from '@/constants/font';
import clsx from 'clsx';
import { Footer } from './footer';
import { Header } from './header';
import { ThemeProvider } from 'next-themes';

export default function Root({ children }: React.PropsWithChildren<{}>) {
  return (
    <div
      className={clsx(
        'dark:bg-gradient-dark flex h-screen min-h-screen flex-col bg-gradient text-black dark:text-white',
        ...fontVariants,
      )}
    >
      <Header />
      <main className="relative flex-grow overflow-auto">{children}</main>
      <Footer />
    </div>
  );
}
