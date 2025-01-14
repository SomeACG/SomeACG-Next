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
        'dark:bg-gradient-dark flex min-h-screen flex-col bg-gradient text-black dark:text-white',
        ...fontVariants,
      )}
    >
      <Header />
      <main className="relative">{children}</main>
      <Footer />
    </div>
  );
}
