'use client';

import { ProviderComposer } from '@/components/common/ProviderComposer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { ThemeProvider } from 'next-themes';
import { ReactElement, useState } from 'react';
import { SWRConfig } from 'swr';

export default function Providers({ children }: { children: ReactElement }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            refetchIntervalInBackground: false,
          },
        },
      }),
  );

  const contexts: JSX.Element[] = [
    <ThemeProvider attribute="class" key="ThemeProvider" />,
    <QueryClientProvider client={queryClient} key="QueryClientProvider" />,
    <JotaiProvider key="JotaiProvider" />,

    <SWRConfig
      key="SWRConfig"
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 5000, // 增加去重间隔到5秒，减少严格模式下重复请求
      }}
    />,
  ];

  return <ProviderComposer contexts={contexts}>{children}</ProviderComposer>;
}
