import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="font-display mt-12 text-4xl font-semibold tracking-tight text-foreground first:mt-0 md:text-5xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-display mt-12 border-b-2 border-foreground pb-3 text-3xl font-semibold tracking-tight text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-display mt-8 text-2xl font-semibold tracking-tight text-foreground">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-display mt-6 text-xl font-semibold text-foreground">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="mt-5 font-body text-lg leading-relaxed text-foreground">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => {
    const external = href?.startsWith("http");
    const className =
      "font-medium text-foreground underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-foreground focus-visible:outline-offset-2";
    if (external) {
      return (
        <a href={href} className={className} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href ?? "#"} className={className}>
        {children}
      </Link>
    );
  },
  ul: ({ children }) => (
    <ul className="markdown-ul mt-5 space-y-2 pl-0 font-body text-lg leading-relaxed">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="markdown-ol mt-5 list-decimal space-y-2 pl-6 font-body text-lg leading-relaxed marker:font-mono marker:text-sm">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-foreground [&>strong]:font-semibold">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="relative my-10 border-l-4 border-foreground py-2 pl-8">
      <span
        className="font-display absolute -left-1 -top-4 text-7xl leading-none text-foreground/10"
        aria-hidden
      >
        &ldquo;
      </span>
      <div className="font-display text-2xl italic leading-snug text-foreground md:text-3xl">
        {children}
      </div>
    </blockquote>
  ),
  hr: () => <hr className="my-12 border-0 section-rule-thick" />,
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return <code className={className}>{children}</code>;
    }
    return (
      <code className="border border-border-light bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto border-2 border-foreground bg-muted p-6 font-mono text-sm leading-relaxed text-foreground">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-8 overflow-x-auto border-2 border-foreground">
      <table className="w-full min-w-[480px] border-collapse text-left font-body text-base">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b-2 border-foreground bg-foreground text-background">{children}</thead>
  ),
  tbody: ({ children }) => <tbody className="divide-y divide-border-light bg-background">{children}</tbody>,
  tr: ({ children }) => <tr className="transition-colors duration-100 hover:bg-muted">{children}</tr>,
  th: ({ children }) => (
    <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-widest text-background">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 align-top text-foreground [&>strong]:font-semibold">{children}</td>
  ),
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("markdown-content max-w-editorial", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
