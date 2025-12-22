import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { EditorState, Prec, Compartment } from "@codemirror/state";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { bracketMatching, indentOnInput } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import React, { useEffect, useRef, useState } from "react";
import { getVitesseTheme } from "@/lib/vitesse-theme";

const systemFont = '"Geist Mono", monospace';

function getCurrentTheme(): boolean {
  if (typeof window === "undefined") return false;
  const root = document.documentElement;
  return root.classList.contains("dark");
}

interface Props {
  initialDocs: string;
  onChange?: (state: EditorState) => void;
  onSave?: () => void;
}

export const useCodeMirror = <T extends Element>(
  props: Props
): [React.RefObject<T | null>, EditorView?] => {
  const refContainer = useRef<T>(null);
  const [editorView, setEditorView] = useState<EditorView>();
  const onChangeRef = useRef(props.onChange);
  const onSaveRef = useRef(props.onSave);
  const isInitializedRef = useRef(false);
  const lastExternalValueRef = useRef(props.initialDocs);
  const [isDark, setIsDark] = useState(getCurrentTheme());
  const themeCompartmentRef = useRef<Compartment | null>(null);

  useEffect(() => {
    onChangeRef.current = props.onChange;
  }, [props.onChange]);

  useEffect(() => {
    onSaveRef.current = props.onSave;
  }, [props.onSave]);

  useEffect(() => {
    const checkTheme = () => {
      const newIsDark = getCurrentTheme();
      if (newIsDark !== isDark) {
        setIsDark(newIsDark);
      }
    };

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", checkTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", checkTheme);
    };
  }, [isDark]);

  useEffect(() => {
    if (!editorView || !themeCompartmentRef.current) return;

    const vitesseTheme = getVitesseTheme(isDark);
    editorView.dispatch({
      effects: themeCompartmentRef.current.reconfigure(vitesseTheme),
    });
  }, [isDark, editorView]);

  useEffect(() => {
    if (!refContainer.current || isInitializedRef.current) return;

    const saveKeymap = keymap.of([
      {
        key: "Mod-s",
        preventDefault: true,
        run: () => {
          if (onSaveRef.current) {
            onSaveRef.current();
            return true;
          }
          return false;
        },
      },
    ]);

    const themeCompartment = new Compartment();
    themeCompartmentRef.current = themeCompartment;
    const vitesseTheme = getVitesseTheme(isDark);

    const startState = EditorState.create({
      doc: props.initialDocs,
      extensions: [
        Prec.highest(saveKeymap),
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
        themeCompartment.of([...vitesseTheme]),
        EditorView.theme({
          "&": {
            height: "100%",
          },
          ".cm-content": {
            fontFamily: systemFont,
          },
          ".cm-gutters": {
            fontFamily: systemFont,
          },
        }),
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
      themeCompartmentRef.current = null;
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
