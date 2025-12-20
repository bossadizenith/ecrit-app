import { isValidElement, type ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Code } from "./code";

interface PreviewProps {
  docs: string;
}

interface CodeElementProps {
  className?: string;
  children?: ReactNode;
}

export const Preview = ({ docs }: PreviewProps) => {
  return (
    <div className="flex-1 bg-muted rounded p-4 border border-border overflow-auto prose prose-sm dark:prose-invert max-w-none no-scrollbar">
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
        }}
      >
        {docs}
      </Markdown>
    </div>
  );
};
