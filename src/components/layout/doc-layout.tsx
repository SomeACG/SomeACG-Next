import { PropsWithChildren } from 'react';

interface DocLayoutProps {
  children: React.ReactNode;
}

export default function DocLayout({ children }: PropsWithChildren<DocLayoutProps>) {
  return (
    <div className="px-4 py-8">
      <div className="prose prose-invert mx-auto max-w-4xl">{children}</div>
    </div>
  );
}
