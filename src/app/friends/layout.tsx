import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '友链 - Cosine Gallery',
  description: 'Cosine Gallery 的友情链接页面',
};

export default function FriendsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="prose prose-invert mx-auto max-w-4xl">{children}</div>
    </div>
  );
}
