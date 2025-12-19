import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { cn } from "@/lib/utils";

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
  const minimize = async () => await getCurrentWindow().minimize();
  const maximize = async () => await getCurrentWindow().maximize();
  const close = async () => await getCurrentWindow().close();

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
        "h-10 flex absolute w-full left-0 items-center justify-between px-3 bg-neutral-950 text-neutral-300 select-none transition-all duration-300 ease-in-out z-30",
        isVisible ? "top-0" : "-top-10"
      )}
    >
      <div data-tauri-drag-region className="flex items-center gap-2 flex-1">
        <span className="text-sm font-medium opacity-70">ecrit</span>
      </div>
      <div data-tauri-no-drag className="flex items-center gap-2">
        <button
          onClick={minimize}
          className="h-6 w-6 rounded hover:bg-neutral-700"
        >
          —
        </button>

        <button
          onClick={maximize}
          className="h-6 w-6 rounded hover:bg-neutral-700"
        >
          ▢
        </button>

        <button onClick={close} className="h-6 w-6 rounded hover:bg-red-600/80">
          ✕
        </button>
      </div>
    </div>
  );
}
