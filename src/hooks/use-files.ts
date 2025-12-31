import { useState, useCallback, useRef, useEffect } from "react";
import {
  openFile,
  saveFile,
  readFile,
  type FileInfo,
} from "@/lib/file-manager";
import {
  saveFileHistory,
  loadFileHistory,
  type FileHistory,
} from "@/lib/file-history";

export interface OpenFile extends FileInfo {
  id: string;
  hasUnsavedChanges: boolean;
}

export interface FileData {
  path: string;
  name: string;
  content: string;
  hasUnsavedChanges: boolean;
}

export function useFiles() {
  const [files, setFiles] = useState<OpenFile[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const fileIdCounter = useRef(0);
  const pendingFileIdRef = useRef<string | null>(null);
  const previousFileIdRef = useRef<string | null>(null);

  const currentFile = files.find((f) => f.id === currentFileId) || null;

  useEffect(() => {
    if (pendingFileIdRef.current) {
      const fileExists = files.some((f) => f.id === pendingFileIdRef.current);
      if (fileExists) {
        setCurrentFileId(pendingFileIdRef.current);
        pendingFileIdRef.current = null;
      }
    }
  }, [files]);

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

      let existingFileId: string | null = null;
      let newFileId: string | null = null;

      setFiles((prev) => {
        const existingFile = prev.find((f) => f.path === file.path);
        if (existingFile) {
          existingFileId = existingFile.id;
          return prev;
        }

        const id = `file-${Date.now()}-${fileIdCounter.current++}`;
        newFileId = id;
        const newFile: OpenFile = {
          id,
          ...file,
          hasUnsavedChanges: false,
        };

        return [...prev, newFile];
      });

      if (existingFileId) {
        setCurrentFileId(existingFileId);
      } else if (newFileId) {
        setCurrentFileId(newFileId);
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
  }, []);

  const handleSaveFile = useCallback(async () => {
    if (!currentFile) return;

    try {
      const savedPath = await saveFile(
        currentFile.content,
        currentFile.path || undefined
      );
      if (!savedPath) return;

      let existingFileWithPathId: string | null = null;

      setFiles((prev) => {
        const existingFileWithPath = prev.find(
          (f) => f.path === savedPath && f.id !== currentFileId
        );

        if (existingFileWithPath) {
          existingFileWithPathId = existingFileWithPath.id;
          return prev.filter((f) => f.id !== currentFileId);
        }

        return prev.map((f) =>
          f.id === currentFileId
            ? {
                ...f,
                path: savedPath,
                name: savedPath.split(/[/\\]/).pop() || "Untitled",
                hasUnsavedChanges: false,
              }
            : f
        );
      });

      if (existingFileWithPathId) {
        setCurrentFileId(existingFileWithPathId);
      }
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

  const switchToFile = useCallback(
    (fileId: string) => {
      // Track previous file before switching
      if (currentFileId && currentFileId !== fileId) {
        previousFileIdRef.current = currentFileId;
      }
      setCurrentFileId(fileId);
    },
    [currentFileId]
  );

  const closeFile = useCallback(
    (fileId: string, skipUnsavedCheck = false) => {
      const fileToClose = files.find((f) => f.id === fileId);

      if (!skipUnsavedCheck && fileToClose?.hasUnsavedChanges) {
        return false;
      }

      setFiles((prev) => {
        const newFiles = prev.filter((f) => f.id !== fileId);

        if (fileId === currentFileId) {
          if (previousFileIdRef.current) {
            const previousFile = newFiles.find(
              (f) => f.id === previousFileIdRef.current
            );
            if (previousFile) {
              setCurrentFileId(previousFileIdRef.current);
              previousFileIdRef.current = null;
            } else if (newFiles.length > 0) {
              setCurrentFileId(newFiles[0].id);
              previousFileIdRef.current = null;
            } else {
              setCurrentFileId(null);
              previousFileIdRef.current = null;
            }
          } else if (newFiles.length > 0) {
            setCurrentFileId(newFiles[0].id);
          } else {
            setCurrentFileId(null);
          }
        }

        return newFiles;
      });
      return true;
    },
    [currentFileId, files]
  );

  const loadFileFromPath = useCallback(async (path: string) => {
    try {
      const file = await readFile(path);
      if (!file) return;
      const normalizePath = (p: string) =>
        p.replace(/\\/g, "/").replace(/\/$/, "").toLowerCase();

      const normalizedInputPath = normalizePath(file.path);

      setFiles((prev) => {
        const existingFile = prev.find(
          (f) => normalizePath(f.path) === normalizedInputPath
        );

        if (existingFile) {
          pendingFileIdRef.current = existingFile.id;
          return prev;
        }

        const id = `file-${Date.now()}-${fileIdCounter.current++}`;
        pendingFileIdRef.current = id;
        const newFile: OpenFile = {
          id,
          ...file,
          hasUnsavedChanges: false,
        };

        return [...prev, newFile];
      });
    } catch (error) {
      console.error("Error loading file from path:", error);
    }
  }, []);

  useEffect(() => {
    if (files.length === 0 && !currentFileId) return;

    const timeoutId = setTimeout(() => {
      saveFileHistory(files, currentFileId);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [files, currentFileId]);

  useEffect(() => {
    const restoreHistory = async () => {
      try {
        const history = loadFileHistory();
        if (!history || history.fileOrder.length === 0) return;
        const restoredFiles: OpenFile[] = [];
        const fileIdMap = new Map<string, string>();

        const historyFilesAny = history.files as
          | FileHistory["files"]
          | Array<FileData>;

        let historyFiles: Record<string, FileData>;

        if (Array.isArray(historyFilesAny)) {
          historyFiles = {};
          historyFilesAny.forEach((f, idx) => {
            const oldId = history.fileOrder[idx] || `file-${idx}`;
            historyFiles[oldId] = f;
          });
        } else {
          historyFiles = historyFilesAny;
        }

        const filesToRestore = history.fileOrder
          .map((oldId) => {
            const historyFile = historyFiles[oldId];
            return historyFile ? { oldId, historyFile } : null;
          })
          .filter(
            (
              item
            ): item is {
              oldId: string;
              historyFile: {
                path: string;
                name: string;
                content: string;
                hasUnsavedChanges: boolean;
              };
            } => item !== null
          );

        for (const { oldId, historyFile } of filesToRestore) {
          if (!historyFile.path && !historyFile.content.trim()) continue;

          let file: FileInfo;
          let hasUnsavedChanges = false;

          if (historyFile.path) {
            try {
              const diskFile = await readFile(historyFile.path);
              if (diskFile) {
                file = diskFile;
                if (
                  historyFile.hasUnsavedChanges &&
                  diskFile.content === historyFile.content
                ) {
                  file.content = historyFile.content;
                  hasUnsavedChanges = true;
                }
              } else {
                continue;
              }
            } catch (error) {
              console.warn(
                `Could not restore file ${historyFile.path}:`,
                error
              );
              continue;
            }
          } else {
            file = {
              path: "",
              name: historyFile.name || "Untitled",
              content: historyFile.content,
            };
            hasUnsavedChanges = historyFile.hasUnsavedChanges;
          }

          const newId = `file-${Date.now()}-${fileIdCounter.current++}`;
          fileIdMap.set(oldId, newId);
          restoredFiles.push({
            id: newId,
            ...file,
            hasUnsavedChanges,
          });
        }

        if (restoredFiles.length > 0) {
          setFiles(restoredFiles);

          if (history.currentFileId) {
            const newCurrentFileId = fileIdMap.get(history.currentFileId);
            if (newCurrentFileId) {
              const restoredCurrentFile = restoredFiles.find(
                (f) => f.id === newCurrentFileId
              );
              if (restoredCurrentFile) {
                setCurrentFileId(newCurrentFileId);
              } else if (restoredFiles.length > 0) {
                setCurrentFileId(restoredFiles[0].id);
              }
            } else if (restoredFiles.length > 0) {
              setCurrentFileId(restoredFiles[0].id);
            }
          } else if (restoredFiles.length > 0) {
            setCurrentFileId(restoredFiles[0].id);
          }
        }
      } catch (error) {
        console.error("Error restoring file history:", error);
      }
    };

    restoreHistory();
  }, []); // Only run on mount

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
