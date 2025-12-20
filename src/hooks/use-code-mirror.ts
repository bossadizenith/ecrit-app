import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import {
  bracketMatching,
  indentOnInput,
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { languages } from "@codemirror/language-data";
import { EditorState } from "@codemirror/state";
// import { oneDark } from "@codemirror/theme-one-dark";
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import React, { useEffect, useRef, useState } from "react";

const systemFont = '"Geist Mono", monospace';

export const transparentTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent !important",
    height: "100%",
  },
  ".cm-content": {
    fontFamily: systemFont,
  },
  ".cm-gutters": {
    fontFamily: systemFont,
  },
});

const customHighlightStyle = HighlightStyle.define([
  {
    tag: tags.heading1,
    fontSize: "2.5em",
    fontWeight: "bold",
  },
  {
    tag: tags.heading2,
    fontSize: "2em",
    fontWeight: "bold",
  },
  {
    tag: tags.heading3,
    fontSize: "1.5em",
    fontWeight: "bold",
  },
]);

interface Props {
  initialDocs: string;
  onChange?: (state: EditorState) => void;
}

export const useCodeMirror = <T extends Element>(
  props: Props
): [React.RefObject<T | null>, EditorView?] => {
  const refContainer = useRef<T>(null);
  const [editorView, setEditorView] = useState<EditorView>();
  const onChangeRef = useRef(props.onChange);
  const isInitializedRef = useRef(false);
  const lastExternalValueRef = useRef(props.initialDocs);

  useEffect(() => {
    onChangeRef.current = props.onChange;
  }, [props.onChange]);

  useEffect(() => {
    if (!refContainer.current || isInitializedRef.current) return;

    const startState = EditorState.create({
      doc: props.initialDocs,
      extensions: [
        keymap.of([...defaultKeymap, ...historyKeymap]),
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        indentOnInput(),
        bracketMatching(),
        highlightActiveLine(),
        markdown({
          base: markdownLanguage,
          codeLanguages: languages,
          addKeymap: true,
        }),
        // oneDark,
        syntaxHighlighting(customHighlightStyle),
        transparentTheme,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.changes && onChangeRef.current) {
            onChangeRef.current(update.state);
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: refContainer.current,
    });

    setEditorView(view);
    isInitializedRef.current = true;
    lastExternalValueRef.current = props.initialDocs;

    return () => {
      view.destroy();
      isInitializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!editorView) return;

    const currentContent = editorView.state.doc.toString();
    // Only update if the external value changed and it's different from current content
    // This prevents updating when the change came from the user typing
    if (
      props.initialDocs !== lastExternalValueRef.current &&
      currentContent !== props.initialDocs
    ) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: props.initialDocs,
        },
      });
      lastExternalValueRef.current = props.initialDocs;
    }
  }, [editorView, props.initialDocs]);

  return [refContainer, editorView];
};
