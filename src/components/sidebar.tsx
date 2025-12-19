import { cn } from "@/lib/utils";

interface SidebarProps {
  isVisible?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Sidebar = ({
  isVisible,
  onMouseEnter,
  onMouseLeave,
}: SidebarProps) => {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "w-96 h-full top-0 z-50 flex absolute p-2 transition-all duration-150 ease-in-out",
        isVisible ? "left-0" : "-left-96"
      )}
      style={{
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="size-full bg-background rounded p-2 border border-border">
        this is the sidebar
      </div>
    </div>
  );
};
