import { useCodeMirror } from "@/hooks/use-code-mirror";
import { EditorState } from "@codemirror/state";
import { useCallback, useEffect } from "react";

interface WriterProps {
  initialDocs: string;
  onChange: (docs: string) => void;
}

export const Writer = ({ initialDocs, onChange }: WriterProps) => {
  const handleChange = useCallback(
    (state: EditorState) => onChange(state.doc.toString()),
    [onChange]
  );

  const [ref, editorView] = useCodeMirror<HTMLDivElement>({
    initialDocs,
    onChange: handleChange,
  });

  useEffect(() => {
    if (editorView) {
    }
  }, [editorView]);

  return (
    <div
      ref={ref}
      data-ecrit-writer
      className="flex-1 rounded bg-muted border border-border outline-none"
    />
  );
};
