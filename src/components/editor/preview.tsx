import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PreviewProps {
  docs: string;
}

export const Preview = ({ docs }: PreviewProps) => {
  return (
    <div className="flex-1 bg-muted rounded p-4 border border-border prose prose-sm dark:prose-invert max-w-none">
      <Markdown remarkPlugins={[remarkGfm]}>{docs}</Markdown>
    </div>
  );
};
