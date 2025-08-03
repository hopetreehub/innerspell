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
function CustomLink({ href, children, ...props }: { href?: string; children?: ReactNode; [key: string]: any }) {
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
function CodeBlock({ children, className, ...props }: { children?: ReactNode; className?: string; [key: string]: any }) {
  return (
    <pre className={`${className} bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto`}>
      <code>{children}</code>
    </pre>
  );
}

// 인라인 코드 컴포넌트
function InlineCode({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
      {children}
    </code>
  );
}

// 블록쿼트 컴포넌트
function Blockquote({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 my-6">
      {children}
    </blockquote>
  );
}

// 테이블 컴포넌트들
function Table({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </table>
    </div>
  );
}

function TableHead({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
      {children}
    </thead>
  );
}

function TableBody({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700" {...props}>
      {children}
    </tbody>
  );
}

function TableRow({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800" {...props}>
      {children}
    </tr>
  );
}

function TableCell({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </td>
  );
}

function TableHeader({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" {...props}>
      {children}
    </th>
  );
}

// 헤딩 컴포넌트들
function H1({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h1>
  );
}

function H2({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <h2 className="text-3xl font-semibold mb-4 mt-8 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h2>
  );
}

function H3({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <h3 className="text-2xl font-semibold mb-3 mt-6 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h3>
  );
}

function H4({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <h4 className="text-xl font-semibold mb-2 mt-4 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h4>
  );
}

// 리스트 컴포넌트들
function UnorderedList({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <ul className="list-disc list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </ul>
  );
}

function OrderedList({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <ol className="list-decimal list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </ol>
  );
}

function ListItem({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <li className="text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </li>
  );
}

// 단락 컴포넌트
function Paragraph({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props}>
      {children}
    </p>
  );
}

// 강조 컴포넌트들
function Strong({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </strong>
  );
}

function Emphasis({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return (
    <em className="italic text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </em>
  );
}

// 구분선
function HorizontalRule({ ...props }: { [key: string]: any }) {
  return (
    <hr className="my-8 border-gray-200 dark:border-gray-700" {...props} />
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