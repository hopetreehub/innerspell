'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

// Tiptap 에디터를 lazy load
export const LazyRichTextEditor = dynamic(
  () => import('@/components/blog/RichTextEditor').then(mod => mod.RichTextEditor),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/20">
        <Spinner />
      </div>
    ),
    ssr: false
  }
);

// MDX 에디터를 lazy load
export const LazyMDXEditor = dynamic(
  () => import('@mdxeditor/editor').then(mod => mod.MDXEditor),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/20">
        <Spinner />
      </div>
    ),
    ssr: false
  }
);