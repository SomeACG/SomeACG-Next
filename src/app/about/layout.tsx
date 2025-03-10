import { PropsWithChildren } from 'react';

export default function AboutLayout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex max-w-(--breakpoint-lg) flex-col gap-12 p-4">{children}</div>
    </div>
  );
}
