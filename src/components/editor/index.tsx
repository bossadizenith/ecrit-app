import { useCallback } from "react";
import { Preview } from "./preview";
import { Writer } from "./writer";

interface EditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onSave?: () => void;
}

export const Editor = ({ content, onContentChange, onSave }: EditorProps) => {
  const handleDocsChange = useCallback(
    (docs: string) => {
      onContentChange(docs);
    },
    [onContentChange]
  );

  return (
    <div className="size-full flex gap-2">
      <Writer
        initialDocs={content}
        onChange={handleDocsChange}
        onSave={onSave}
      />
      <Preview docs={content} />
    </div>
  );
};
