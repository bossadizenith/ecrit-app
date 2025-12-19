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
      className={`w-96 h-full top-0 z-50 flex absolute p-2 text-neutral-300 transition-all duration-300 ease-in-out ${
        isVisible ? "left-0" : "-left-96"
      }`}
      style={{
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="size-full bg-neutral-950 rounded p-2 border border-neutral-500/25">
        this is the sidebar
      </div>
    </div>
  );
};
