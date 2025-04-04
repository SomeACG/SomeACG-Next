import type { Metadata } from 'next';
import DocLayout from '@/components/layout/doc-layout';

export const metadata: Metadata = {
  title: '友链 - Cosine Gallery',
  description: 'Cosine Gallery 的友情链接页面',
};

export default function FriendsLayout({ children }: { children: React.ReactNode }) {
  return <DocLayout>{children}</DocLayout>;
}
