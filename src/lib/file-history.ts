import type { OpenFile } from "@/hooks/use-files";

const HISTORY_STORAGE_KEY = "ecrit-file-history";

export interface FileHistory {
  files: Record<
    string,
    {
      path: string;
      name: string;
      content: string;
      hasUnsavedChanges: boolean;
    }
  >;
  currentFileId: string | null;
  fileOrder: string[];
}

export function saveFileHistory(
  files: OpenFile[],
  currentFileId: string | null
): void {
  try {
    const filesMap: FileHistory["files"] = {};
    files.forEach((file) => {
      filesMap[file.id] = {
        path: file.path,
        name: file.name,
        content: file.content,
        hasUnsavedChanges: file.hasUnsavedChanges,
      };
    });

    const history: FileHistory = {
      files: filesMap,
      currentFileId,
      fileOrder: files.map((f) => f.id),
    };

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error saving file history:", error);
  }
}

export function loadFileHistory(): FileHistory | null {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return null;

    const history = JSON.parse(stored) as FileHistory;
    return history;
  } catch (error) {
    console.error("Error loading file history:", error);
    return null;
  }
}

export function clearFileHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing file history:", error);
  }
}
