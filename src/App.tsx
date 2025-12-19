import { useRef, useState } from "react";
import { Editor } from "./components/editor";
import { Sidebar } from "./components/sidebar";
import { TitleBar } from "./components/title-bar";
import { useEdgeDetection } from "./hooks/use-edge-detection";
import { useWindowZoom } from "./hooks/use-window";

export default function App() {
  useWindowZoom();
  const [isTitleBarVisible, setIsTitleBarVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
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
        />
        <Editor />
      </main>
    </div>
  );
}
