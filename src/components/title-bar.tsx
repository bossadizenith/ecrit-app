import { useEffect, useRef, useState } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface TitleBarProps {
  isVisible?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function TitleBar({
  isVisible = true,
  onMouseEnter,
  onMouseLeave,
}: TitleBarProps) {
  const titleBarRef = useRef<HTMLDivElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const minimize = async () => await getCurrentWindow().minimize();
  const close = async () => await getCurrentWindow().close();

  useEffect(() => {
    const checkMaximized = async () => {
      const max = await getCurrentWindow().isMaximized();
      setIsMaximized(max);
    };

    checkMaximized();
  }, []);

  const toggleMaximize = async () => {
    const window = getCurrentWindow();
    if (isMaximized) {
      await window.unmaximize();
      setIsMaximized(false);
    } else {
      await window.maximize();
      setIsMaximized(true);
    }
  };

  useEffect(() => {
    const titleBar = titleBarRef.current;
    if (!titleBar) return;

    const handleMouseDown = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("[data-tauri-no-drag]")) {
        return;
      }
      if (e.button === 0) {
        if (e.detail === 2) {
          await getCurrentWindow().toggleMaximize();
        } else {
          await getCurrentWindow().startDragging();
        }
      }
    };

    titleBar.addEventListener("mousedown", handleMouseDown);
    return () => {
      titleBar.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <div
      ref={titleBarRef}
      data-tauri-drag-region
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "h-10 flex absolute w-full left-0 items-center justify-between px-3 bg-background select-none transition-all duration-150 border-b border-border ease-in-out z-30",
        isVisible ? "top-0" : "-top-10"
      )}
    >
      <div data-tauri-drag-region className="flex items-center gap-2 flex-1">
        <span className="text-sm font-medium opacity-70">ecrit</span>
      </div>
      <div data-tauri-no-drag className="flex items-center gap-2">
        <Button
          onClick={minimize}
          size="icon"
          className="size-6"
          variant="ghost"
        >
          —
        </Button>

        <Button
          onClick={toggleMaximize}
          size="icon"
          className="size-6"
          variant="ghost"
        >
          ▢
        </Button>

        <Button
          onClick={close}
          size="icon"
          className="size-6 hover:bg-red-600/80 hover:dark:bg-red-600/80 hover:text-white"
          variant="ghost"
        >
          ✕
        </Button>
      </div>
    </div>
  );
}
