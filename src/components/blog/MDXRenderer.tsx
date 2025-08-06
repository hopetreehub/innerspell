'use client';

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { useMDXComponents } from '../../../mdx-components';

interface MDXRendererProps {
  content: MDXRemoteSerializeResult;
}

export function MDXRenderer({ content }: MDXRendererProps) {
  const components = useMDXComponents({});
  
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <MDXRemote {...content} components={components} />
    </div>
  );
}