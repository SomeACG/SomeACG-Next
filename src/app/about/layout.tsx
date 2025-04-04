import { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import DocLayout from '@/components/layout/doc-layout';

export const metadata: Metadata = {
  title: '关于 - Cosine Gallery',
  description: 'Cosine Gallery 的关于页面',
};

export default function AboutLayout({ children }: PropsWithChildren<{}>) {
  return <DocLayout>{children}</DocLayout>;
}
