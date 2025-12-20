import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import type { OpenFile } from "@/hooks/use-files";

interface SidebarProps {
  isVisible?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  files: OpenFile[];
  currentFileId: string | null;
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onSwitchFile: (fileId: string) => void;
  onCloseFile: (fileId: string) => void;
}

export const Sidebar = ({
  isVisible,
  onMouseEnter,
  onMouseLeave,
  files,
  currentFileId,
  onNewFile,
  onOpenFile,
  onSaveFile,
  onSwitchFile,
  onCloseFile,
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
      <div className="size-full bg-background rounded p-2 border border-border flex flex-col">
        {/* Header with action buttons */}
        <div className="flex gap-2 mb-4 pb-4 border-b border-border">
          <Button onClick={onNewFile} size="sm" className="flex-1">
            New
          </Button>
          <Button
            onClick={onOpenFile}
            size="sm"
            className="flex-1"
            variant="outline"
          >
            Open
          </Button>
          <Button
            onClick={onSaveFile}
            size="sm"
            className="flex-1"
            variant="outline"
            disabled={!currentFileId}
          >
            Save
          </Button>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-auto">
          {files.length === 0 ? (
            <div className="text-muted-foreground text-sm text-center py-8">
              No files open
            </div>
          ) : (
            <div className="space-y-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "group flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                    currentFileId === file.id ? "bg-muted" : "hover:bg-muted/50"
                  )}
                  onClick={() => onSwitchFile(file.id)}
                >
                  <span
                    className={cn(
                      "flex-1 text-sm truncate",
                      currentFileId === file.id
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {file.name}
                    {file.hasUnsavedChanges && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        •
                      </span>
                    )}
                  </span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseFile(file.id);
                    }}
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
