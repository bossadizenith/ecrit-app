"use client";

import { useEffect, useState } from "react";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { useTheme } from "../theme-provider";

type CodeProps = {
  code: string;
};

export function Code({ code }: CodeProps) {
  const { theme } = useTheme();
  const [highlightedCode, setHighlightedCode] = useState<string>("");

  useEffect(() => {
    const currentTheme = theme || "light";
    const codeTheme =
      currentTheme === "dark" ? "vitesse-dark" : "vitesse-light";

    const highlightCode = async () => {
      const file = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypePrettyCode, {
          theme: codeTheme,
        })
        .use(rehypeStringify)
        .process(code);

      setHighlightedCode(String(file));
    };

    highlightCode();
  }, [code, theme]);

  return (
    <div className="relative w-full antialiased border border-border">
      <section
        className="text-xl"
        dangerouslySetInnerHTML={{
          __html: highlightedCode,
        }}
      />
    </div>
  );
}
