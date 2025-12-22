import { isValidElement, type ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Code } from "./code";
import { cn } from "@/lib/utils";

interface PreviewProps {
  docs: string;
}

interface CodeElementProps {
  className?: string;
  children?: ReactNode;
}

export const Preview = ({ docs }: PreviewProps) => {
  return (
    <div className="flex-1 bg-background rounded p-4 border border-border overflow-auto prose prose-sm dark:prose-invert max-w-none no-scrollbar">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="text-muted-foreground text-base/7">{children}</p>
          ),
          pre: ({ children, ...props }) => {
            if (isValidElement(children)) {
              const codeProps = children.props as CodeElementProps;
              const className = codeProps?.className || "";
              const match = /language-(\w+)/.exec(className);
              const codeContent = String(codeProps?.children || "").trim();

              if (match) {
                const language = match[1];
                const codeBlock = `\`\`\`${language}\n${codeContent}\n\`\`\``;
                return <Code code={codeBlock} />;
              }
            }

            return <pre {...props}>{children}</pre>;
          },
          strong: ({ children, ...props }) => (
            <strong {...props} className="text-foreground font-semibold">
              {children}
            </strong>
          ),
          code: ({ children, className, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            if (match) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-background inline-flex border-border font-mono rounded border px-1.5 py-px text-sm">
                {children}
              </code>
            );
          },
          a: ({ children, href, ...props }) => (
            <a
              href={href ?? "#"}
              className="text-foreground inline font-medium underline underline-offset-4"
              target={href?.startsWith("/") ? undefined : "_blank"}
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="text-muted-foreground list-inside list-disc space-y-2 pl-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="text-muted-foreground ml-4 list-decimal space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1 text-base/7">{children}</li>
          ),
          h1: ({ children }) => (
            <h1 className="text-foreground text-4xl font-medium">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-foreground text-3xl font-medium">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-foreground text-2xl font-medium">{children}</h3>
          ),
          hr: () => <hr className="border-border" />,
          table: ({
            className,
            ...props
          }: React.HTMLAttributes<HTMLTableElement>) => (
            <div className="w-full overflow-y-auto">
              <table className={cn("w-full", className)} {...props} />
            </div>
          ),
          tr: ({
            className,
            ...props
          }: React.HTMLAttributes<HTMLTableRowElement>) => (
            <tr
              className={cn(
                "m-0 border-t border-border p-0 even:bg-muted",
                className
              )}
              {...props}
            />
          ),
          th: ({
            className,
            ...props
          }: React.HTMLAttributes<HTMLTableCellElement>) => (
            <th
              className={cn(
                "border border-border px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right",
                className
              )}
              {...props}
            />
          ),
          td: ({
            className,
            ...props
          }: React.HTMLAttributes<HTMLTableCellElement>) => (
            <td
              className={cn(
                "border border-border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right",
                className
              )}
              {...props}
            />
          ),
        }}
      >
        {docs}
      </Markdown>
    </div>
  );
};
