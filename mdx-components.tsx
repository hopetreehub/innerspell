import type { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

// 커스텀 이미지 컴포넌트
function ResponsiveImage(props: ImageProps) {
  return (
    <Image
      {...props}
      className="rounded-lg shadow-md"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}

// 커스텀 링크 컴포넌트
function CustomLink({ href, children, ...props }: { href?: string; children: ReactNode }) {
  if (href?.startsWith('/')) {
    return (
      <Link href={href} {...props} className="text-blue-600 hover:text-blue-800 underline">
        {children}
      </Link>
    );
  }
  
  if (href?.startsWith('#')) {
    return (
      <a href={href} {...props} className="text-blue-600 hover:text-blue-800 underline">
        {children}
      </a>
    );
  }
  
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      {...props}
      className="text-blue-600 hover:text-blue-800 underline"
    >
      {children}
    </a>
  );
}

// 코드 블록 컴포넌트
function CodeBlock({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <pre className={`${className} bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto`}>
      <code>{children}</code>
    </pre>
  );
}

// 인라인 코드 컴포넌트
function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
      {children}
    </code>
  );
}

// 블록쿼트 컴포넌트
function Blockquote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 my-6">
      {children}
    </blockquote>
  );
}

// 테이블 컴포넌트들
function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </table>
    </div>
  );
}

function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-gray-50 dark:bg-gray-800">
      {children}
    </thead>
  );
}

function TableBody({ children }: { children: ReactNode }) {
  return (
    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </tbody>
  );
}

function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
      {children}
    </tr>
  );
}

function TableCell({ children }: { children: ReactNode }) {
  return (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
      {children}
    </td>
  );
}

function TableHeader({ children }: { children: ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
      {children}
    </th>
  );
}

// 헤딩 컴포넌트들
function H1({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
      {children}
    </h1>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-3xl font-semibold mb-4 mt-8 text-gray-900 dark:text-gray-100">
      {children}
    </h2>
  );
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-2xl font-semibold mb-3 mt-6 text-gray-900 dark:text-gray-100">
      {children}
    </h3>
  );
}

function H4({ children }: { children: ReactNode }) {
  return (
    <h4 className="text-xl font-semibold mb-2 mt-4 text-gray-900 dark:text-gray-100">
      {children}
    </h4>
  );
}

// 리스트 컴포넌트들
function UnorderedList({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300">
      {children}
    </ul>
  );
}

function OrderedList({ children }: { children: ReactNode }) {
  return (
    <ol className="list-decimal list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300">
      {children}
    </ol>
  );
}

function ListItem({ children }: { children: ReactNode }) {
  return (
    <li className="text-gray-700 dark:text-gray-300">
      {children}
    </li>
  );
}

// 단락 컴포넌트
function Paragraph({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
      {children}
    </p>
  );
}

// 강조 컴포넌트들
function Strong({ children }: { children: ReactNode }) {
  return (
    <strong className="font-semibold text-gray-900 dark:text-gray-100">
      {children}
    </strong>
  );
}

function Emphasis({ children }: { children: ReactNode }) {
  return (
    <em className="italic text-gray-700 dark:text-gray-300">
      {children}
    </em>
  );
}

// 구분선
function HorizontalRule() {
  return (
    <hr className="my-8 border-gray-200 dark:border-gray-700" />
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // 기본 HTML 요소들
    img: ResponsiveImage as any,
    a: CustomLink,
    pre: CodeBlock,
    code: InlineCode,
    blockquote: Blockquote,
    table: Table,
    thead: TableHead,
    tbody: TableBody,
    tr: TableRow,
    td: TableCell,
    th: TableHeader,
    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    ul: UnorderedList,
    ol: OrderedList,
    li: ListItem,
    p: Paragraph,
    strong: Strong,
    em: Emphasis,
    hr: HorizontalRule,
    
    // 커스텀 컴포넌트들을 여기에 추가할 수 있습니다
    ...components,
  };
}