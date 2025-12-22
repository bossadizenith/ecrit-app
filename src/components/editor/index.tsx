import { useCallback, useEffect } from "react";
import { Preview } from "./preview";
import { Writer } from "./writer";

interface EditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onSave?: () => void;
  onClose?: () => void;
}

export const Editor = ({
  content,
  onContentChange,
  onSave,
  onClose,
}: EditorProps) => {
  const handleDocsChange = useCallback(
    (docs: string) => {
      onContentChange(docs);
    },
    [onContentChange]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "w") {
        e.preventDefault();
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
