import { PropsWithChildren } from 'react';

export default function HomeLayout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex flex-col gap-12 p-4">{children}</div>
    </div>
  );
}
