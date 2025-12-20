import { useState, useCallback, useRef } from "react";
import {
  openFile,
  saveFile,
  readFile,
  type FileInfo,
} from "@/lib/file-manager";

export interface OpenFile extends FileInfo {
  id: string;
  hasUnsavedChanges: boolean;
}

export function useFiles() {
  const [files, setFiles] = useState<OpenFile[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const fileIdCounter = useRef(0);

  const currentFile = files.find((f) => f.id === currentFileId) || null;

  const createNewFile = useCallback(() => {
    const id = `new-${Date.now()}-${fileIdCounter.current++}`;
    const newFile: OpenFile = {
      id,
      path: "",
      name: "Untitled",
      content: "",
      hasUnsavedChanges: false,
    };

    setFiles((prev) => [...prev, newFile]);
    setCurrentFileId(id);
    return id;
  }, []);

  const handleOpenFile = useCallback(async () => {
    try {
      const file = await openFile();
      if (!file) return;

      const existingFile = files.find((f) => f.path === file.path);
      if (existingFile) {
        setCurrentFileId(existingFile.id);
        return;
      }

      const id = `file-${Date.now()}-${fileIdCounter.current++}`;
      const newFile: OpenFile = {
        id,
        ...file,
        hasUnsavedChanges: false,
      };

      setFiles((prev) => [...prev, newFile]);
      setCurrentFileId(id);
    } catch (error) {
      console.error("Error opening file:", error);
    }
  }, [files]);

  const handleSaveFile = useCallback(async () => {
    if (!currentFile) return;

    try {
      const savedPath = await saveFile(
        currentFile.content,
        currentFile.path || undefined
      );
      if (!savedPath) return;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === currentFileId
            ? {
                ...f,
                path: savedPath,
                name: savedPath.split(/[/\\]/).pop() || "Untitled",
                hasUnsavedChanges: false,
              }
            : f
        )
      );
    } catch (error) {
      console.error("Error saving file:", error);
    }
  }, [currentFile, currentFileId]);

  const updateCurrentFileContent = useCallback(
    (content: string) => {
      if (!currentFileId) return;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === currentFileId
            ? { ...f, content, hasUnsavedChanges: true }
            : f
        )
      );
    },
    [currentFileId]
  );

  const switchToFile = useCallback((fileId: string) => {
    setCurrentFileId(fileId);
  }, []);

  const closeFile = useCallback(
    (fileId: string) => {
      setFiles((prev) => {
        const newFiles = prev.filter((f) => f.id !== fileId);

        if (fileId === currentFileId) {
          if (newFiles.length > 0) {
            setCurrentFileId(newFiles[0].id);
          } else {
            setCurrentFileId(null);
          }
        }

        return newFiles;
      });
    },
    [currentFileId]
  );

  const loadFileFromPath = useCallback(
    async (path: string) => {
      try {
        const file = await readFile(path);
        if (!file) return;

        const existingFile = files.find((f) => f.path === path);
        if (existingFile) {
          setCurrentFileId(existingFile.id);
          return;
        }

        const id = `file-${Date.now()}-${fileIdCounter.current++}`;
        const newFile: OpenFile = {
          id,
          ...file,
          hasUnsavedChanges: false,
        };

        setFiles((prev) => [...prev, newFile]);
        setCurrentFileId(id);
      } catch (error) {
        console.error("Error loading file from path:", error);
      }
    },
    [files]
  );

  return {
    files,
    currentFile,
    currentFileId,
    createNewFile,
    handleOpenFile,
    handleSaveFile,
    updateCurrentFileContent,
    switchToFile,
    closeFile,
    loadFileFromPath,
  };
}
