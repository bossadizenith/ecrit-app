import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getAllWebviews } from "@tauri-apps/api/webview";

export function useWindowZoom() {
  const zoomLevelRef = useRef(1.0);
  const devtoolsOpenRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        try {
          const appWindow = getCurrentWindow();
          const webviews = await getAllWebviews();
          const webview = webviews.find((w) => w.label === appWindow.label);

          if (!webview) {
            console.error("Webview not found for window:", appWindow.label);
            return;
          }

          if (event.key === "=" || event.key === "+") {
            event.preventDefault();
            zoomLevelRef.current = Math.min(3.0, zoomLevelRef.current + 0.1);
            await webview.setZoom(zoomLevelRef.current);
          } else if (event.key === "-") {
            event.preventDefault();
            zoomLevelRef.current = Math.max(0.1, zoomLevelRef.current - 0.1);
            await webview.setZoom(zoomLevelRef.current);
          } else if (event.key === "0") {
            event.preventDefault();
            zoomLevelRef.current = 1.0;
            await webview.setZoom(1.0);
          }
        } catch (error) {
          console.error("Error setting zoom:", error);
        }
      }

      if (event.key === "F11") {
        event.preventDefault();
        try {
          const appWindow = getCurrentWindow();
          const isFullscreen = await appWindow.isFullscreen();
          await appWindow.setFullscreen(!isFullscreen);
        } catch (error) {
          console.error("Error toggling fullscreen:", error);
        }
      }
      if (event.key === "F12") {
        event.preventDefault();
        try {
          const { invoke } = await import("@tauri-apps/api/core");
          devtoolsOpenRef.current = !devtoolsOpenRef.current;
          await invoke("toggle_devtools", { open: devtoolsOpenRef.current });
        } catch (error) {
          console.error("Error toggling devtools:", error);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
