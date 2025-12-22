import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

const vitesseLight = {
  editorBackground: "#ffffff",
  editorForeground: "#393a34",
  editorLineHighlight: "#f7f7f7",
  editorLineNumber: "#393a3450",
  editorLineNumberActive: "#4e4f47",
  editorSelection: "#22222218",
  editorSelectionHighlight: "#22222210",
  editorIndentGuide: "#00000015",
  editorIndentGuideActive: "#00000030",
  editorWhitespace: "#00000015",
  editorGutter: "#ffffff",
  editorGutterBorder: "#f0f0f0",
  comment: "#a0ada0",
  keyword: "#1e754f",
  string: "#b56959",
  number: "#2f798a",
  function: "#59873a",
  variable: "#b07d48",
  type: "#2e8f82",
  constant: "#a65e2b",
  punctuation: "#999999",
  property: "#998418",
  heading: "#1c6b48",
};

// Vitesse Dark theme colors
const vitesseDark = {
  editorBackground: "#121212",
  editorForeground: "#dbd7caee",
  editorLineHighlight: "#181818",
  editorLineNumber: "#dedcd550",
  editorLineNumberActive: "#bfbaaa",
  editorSelection: "#eeeeee18",
  editorSelectionHighlight: "#eeeeee10",
  editorIndentGuide: "#ffffff15",
  editorIndentGuideActive: "#ffffff30",
  editorWhitespace: "#ffffff15",
  editorGutter: "#121212",
  editorGutterBorder: "#191919",
  comment: "#758575dd",
  keyword: "#4d9375",
  string: "#c98a7d",
  number: "#4C9A91",
  function: "#80a665",
  variable: "#bd976a",
  type: "#5DA994",
  constant: "#c99076",
  punctuation: "#666666",
  property: "#b8a965",
  heading: "#4d9375",
};

function createVitesseTheme(colors: typeof vitesseLight) {
  const highlightStyle = HighlightStyle.define([
    { tag: t.comment, color: colors.comment },
    { tag: t.lineComment, color: colors.comment },
    { tag: t.blockComment, color: colors.comment },
    { tag: t.keyword, color: colors.keyword },
    { tag: t.string, color: colors.string },
    { tag: t.number, color: colors.number },
    { tag: t.function(t.name), color: colors.function },
    { tag: t.variableName, color: colors.variable },
    { tag: t.typeName, color: colors.type },
    // { tag: t., color: colors.constant },
    { tag: t.punctuation, color: colors.punctuation },
    { tag: t.propertyName, color: colors.property },
    { tag: t.heading1, color: colors.heading, fontWeight: "bold" },
    { tag: t.heading2, color: colors.heading, fontWeight: "bold" },
    { tag: t.heading3, color: colors.heading, fontWeight: "bold" },
    { tag: t.heading4, color: colors.heading, fontWeight: "bold" },
    { tag: t.heading5, color: colors.heading, fontWeight: "bold" },
    { tag: t.heading6, color: colors.heading, fontWeight: "bold" },
    { tag: t.strong, fontWeight: "bold", color: colors.editorForeground },
    { tag: t.emphasis, fontStyle: "italic", color: colors.editorForeground },
    { tag: t.link, color: colors.string },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: t.monospace, fontFamily: "monospace" },
    { tag: t.quote, color: colors.string },
    { tag: t.list, color: colors.editorForeground },
    { tag: t.content, color: colors.editorForeground },
  ]);

  const editorTheme = EditorView.theme({
    "&": {
      backgroundColor: colors.editorBackground,
      color: colors.editorForeground,
    },
    ".cm-content": {
      backgroundColor: colors.editorBackground,
      color: colors.editorForeground,
    },
    ".cm-focused .cm-selectionBackground": {
      backgroundColor: colors.editorSelection,
    },
    ".cm-selectionBackground": {
      backgroundColor: colors.editorSelectionHighlight,
    },
    ".cm-line": {
      color: colors.editorForeground,
    },
    ".cm-gutters": {
      backgroundColor: colors.editorGutter,
      borderRight: `1px solid ${colors.editorGutterBorder}`,
    },
    ".cm-lineNumbers .cm-gutterElement": {
      color: colors.editorLineNumber,
    },
    ".cm-activeLineGutter .cm-gutterElement": {
      color: colors.editorLineNumberActive,
      backgroundColor: colors.editorLineHighlight,
    },
    ".cm-activeLine": {
      backgroundColor: colors.editorLineHighlight,
    },
    ".cm-cursor": {
      borderLeftColor: colors.editorForeground,
    },
  });

  return [editorTheme, syntaxHighlighting(highlightStyle)];
}

export function getVitesseTheme(isDark: boolean) {
  return createVitesseTheme(isDark ? vitesseDark : vitesseLight);
}
