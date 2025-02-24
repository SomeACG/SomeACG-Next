import { PropsWithChildren } from 'react';

export default function TagLayout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-12 px-8 py-4 md:px-4">{children}</div>
    </div>
  );
}
