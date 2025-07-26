import { PropsWithChildren } from 'react';

export default function HomeLayout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="h-full overflow-auto">
      <div className="flex flex-col gap-12 px-8 py-4 md:px-4">{children}</div>
    </div>
  );
}
