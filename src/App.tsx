import { useRef, useState, useEffect } from "react";
import { Editor } from "./components/editor";
import { EmptyState } from "./components/editor/empty-state";
import { Sidebar } from "./components/sidebar";
import { TitleBar } from "./components/title-bar";
import { useEdgeDetection } from "./hooks/use-edge-detection";
import { useWindowZoom } from "./hooks/use-window";
import { useFiles } from "./hooks/use-files";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { saveFileHistory } from "./lib/file-history";

export default function App() {
  useWindowZoom();
  const [isTitleBarVisible, setIsTitleBarVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingCloseFileId, setPendingCloseFileId] = useState<string | null>(
    null
  );

  const {
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
  } = useFiles();
  const titleBarHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const sidebarHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleTitleBarMouseEnter = () => {
    if (titleBarHideTimeoutRef.current) {
      clearTimeout(titleBarHideTimeoutRef.current);
      titleBarHideTimeoutRef.current = null;
    }
    setIsTitleBarVisible(true);
  };

  const handleTitleBarMouseLeave = () => {
    titleBarHideTimeoutRef.current = setTimeout(() => {
      setIsTitleBarVisible(false);
    }, 200);
  };

  const handleSidebarMouseEnter = () => {
    if (sidebarHideTimeoutRef.current) {
      clearTimeout(sidebarHideTimeoutRef.current);
      sidebarHideTimeoutRef.current = null;
    }
    setIsSidebarVisible(true);
  };

  const handleSidebarMouseLeave = () => {
    if (sidebarHideTimeoutRef.current) {
      clearTimeout(sidebarHideTimeoutRef.current);
    }
    sidebarHideTimeoutRef.current = setTimeout(() => {
      setIsSidebarVisible(false);
    }, 200);
  };

  useEdgeDetection({
    topThreshold: 2,
    leftThreshold: 2,
    onTopEdge: (isNear) => {
      if (isNear) handleTitleBarMouseEnter();
    },
    onLeftEdge: (isNear) => {
      if (isNear) handleSidebarMouseEnter();
    },
  });

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupFileListener = async () => {
      try {
        const initialPath = await invoke<string | null>(
          "get_initial_file_path"
        );
        if (initialPath) {
          loadFileFromPath(initialPath);
        }

        unlisten = await listen<string>("file-opened", (event) => {
          const filePath = event.payload;
          if (filePath) {
            loadFileFromPath(filePath);
          }
        });
      } catch (error) {
        console.error("Error setting up file listener:", error);
      }
    };

    setupFileListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [loadFileFromPath]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveFileHistory(files, currentFileId);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    let unlistenTauri: (() => void) | undefined;
    const setupTauriCloseHandler = async () => {
      try {
        if (typeof window !== "undefined" && "__TAURI__" in window) {
          const window_ = getCurrentWindow();
          unlistenTauri = await window_.onCloseRequested(() => {
            saveFileHistory(files, currentFileId);
          });
        }
      } catch (error) {
        console.warn("Could not set up Tauri close handler:", error);
      }
    };

    setupTauriCloseHandler();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (unlistenTauri) {
        unlistenTauri();
      }
    };
  }, [files, currentFileId]);

  return (
    <div className="h-screen w-screen">
      <main className="size-full rounded overflow-hidden border border-border bg-muted shadow-2xl p-2 relative">
        <TitleBar
          isVisible={isTitleBarVisible}
          currentFile={currentFile}
          onMouseEnter={handleTitleBarMouseEnter}
          onMouseLeave={handleTitleBarMouseLeave}
        />
        <Sidebar
          isVisible={isSidebarVisible}
          onMouseEnter={handleSidebarMouseEnter}
          onMouseLeave={handleSidebarMouseLeave}
          files={files}
          currentFileId={currentFileId}
          onNewFile={createNewFile}
          onOpenFile={handleOpenFile}
          onSaveFile={handleSaveFile}
          onSwitchFile={switchToFile}
          onCloseFile={(fileId) => {
            const file = files.find((f) => f.id === fileId);
            if (file?.hasUnsavedChanges) {
              setPendingCloseFileId(fileId);
              setShowUnsavedDialog(true);
            } else {
              closeFile(fileId, true);
            }
          }}
        />
        {currentFile ? (
          <Editor
            content={currentFile.content}
            onContentChange={updateCurrentFileContent}
            onSave={handleSaveFile}
            onClose={() => {
              if (currentFile.hasUnsavedChanges) {
                setPendingCloseFileId(currentFile.id);
                setShowUnsavedDialog(true);
              } else {
                closeFile(currentFile.id, true);
              }
            }}
          />
        ) : (
          <EmptyState onNewFile={createNewFile} onOpenFile={handleOpenFile} />
        )}
      </main>

      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              {pendingCloseFileId
                ? `"${
                    files.find((f) => f.id === pendingCloseFileId)?.name ||
                    "Untitled"
                  }" has unsaved changes. What would you like to do?`
                : "This file has unsaved changes. What would you like to do?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUnsavedDialog(false);
                setPendingCloseFileId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingCloseFileId) {
                  closeFile(pendingCloseFileId, true);
                  setShowUnsavedDialog(false);
                  setPendingCloseFileId(null);
                }
              }}
            >
              Discard
            </Button>
            <Button
              onClick={async () => {
                if (pendingCloseFileId) {
                  const fileToClose = files.find(
                    (f) => f.id === pendingCloseFileId
                  );
                  if (fileToClose && fileToClose.id === currentFileId) {
                    await handleSaveFile();
                  }
                  closeFile(pendingCloseFileId, true);
                  setShowUnsavedDialog(false);
                  setPendingCloseFileId(null);
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
