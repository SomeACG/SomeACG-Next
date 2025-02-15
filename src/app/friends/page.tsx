'use client';

import { ClientOnly } from '@/components/common/ClientOnly';
import FriendsMdx from './friends.mdx';

export default function Friends() {
  return (
    <ClientOnly>
      <div className="prose dark:prose-invert max-w-none">
        <FriendsMdx />
      </div>
    </ClientOnly>
  );
}
