'use client';

import { ClientOnly } from '@/components/common/ClientOnly';
import AboutMdx from './about.mdx';

export default function About() {
  return (
    <ClientOnly>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <AboutMdx />
      </div>
    </ClientOnly>
  );
}
