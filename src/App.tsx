import { useRef, useState, useEffect } from "react";
import { Editor } from "./components/editor";
import { EmptyState } from "./components/editor/empty-state";
import { Sidebar } from "./components/sidebar";
import { TitleBar } from "./components/title-bar";
import { useEdgeDetection } from "./hooks/use-edge-detection";
import { useWindowZoom } from "./hooks/use-window";
import { useFiles } from "./hooks/use-files";
import { listen } from "@tauri-apps/api/event";

export default function App() {
  useWindowZoom();
  const [isTitleBarVisible, setIsTitleBarVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

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

  // Listen for file open events from the system
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupFileListener = async () => {
      try {
        unlisten = await listen<string>("file-opened", (event) => {
          const filePath = event.payload;
          if (filePath) {
            loadFileFromPath(filePath);
          }
        });
      } catch (error) {
        console.error("Error setting up file open listener:", error);
      }
    };

    setupFileListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [loadFileFromPath]);

  return (
    <div className="h-screen w-screen">
      <main className="size-full rounded overflow-hidden border border-border bg-background shadow-2xl p-2 relative">
        <TitleBar
          isVisible={isTitleBarVisible}
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
          onCloseFile={closeFile}
        />
        {currentFile ? (
          <Editor
            content={currentFile.content}
            onContentChange={updateCurrentFileContent}
            onSave={handleSaveFile}
          />
        ) : (
          <EmptyState onNewFile={createNewFile} onOpenFile={handleOpenFile} />
        )}
      </main>
    </div>
  );
}
