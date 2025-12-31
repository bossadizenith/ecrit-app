import { useCodeMirror } from "@/hooks/use-code-mirror";
import { EditorState } from "@codemirror/state";
import { memo, useCallback } from "react";

interface WriterProps {
  initialDocs: string;
  onChange: (docs: string) => void;
  onSave?: () => void;
}

export const Writer = memo(function Writer({
  initialDocs,
  onChange,
  onSave,
}: WriterProps) {
  const handleChange = useCallback(
    (state: EditorState) => onChange(state.doc.toString()),
    [onChange]
  );

  const [ref] = useCodeMirror<HTMLDivElement>({
    initialDocs,
    onChange: handleChange,
    onSave,
  });

  return (
    <div
      ref={ref}
      data-ecrit-writer
      className="flex-1 rounded bg-background border overflow-hidden border-border dark:border-muted-foreground/25 outline-none"
    />
  );
});
