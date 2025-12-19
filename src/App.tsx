import { useState, useRef } from "react";
import { TitleBar } from "./components/title-bar";
import { Sidebar } from "./components/sidebar";
import { useWindowZoom } from "./hooks/use-window";
import { useEdgeDetection } from "./hooks/use-edge-detection";

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
      if (isNear) {
        handleTitleBarMouseEnter();
      }
    },
    onLeftEdge: (isNear) => {
      if (isNear) {
        handleSidebarMouseEnter();
      }
    },
  });

  return (
    <div className="h-screen w-screen bg-transparent">
      <main className="size-full rounded-md overflow-hidden bg-neutral-950 border shadow-2xl p-2 relative">
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
        <div className="size-full flex gap-2">
          <div className="flex-1 bg-neutral-900 rounded">
            <button
              onClick={() => {
                console.log("nothing is working rn");
              }}
            >
              click me
            </button>
          </div>
          <div className="flex-1 bg-neutral-900 rounded">preview</div>
        </div>
      </main>
    </div>
  );
}
