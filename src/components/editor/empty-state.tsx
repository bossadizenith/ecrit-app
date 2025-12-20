interface EmptyStateProps {
  onNewFile: () => void;
  onOpenFile: () => void;
}

export const EmptyState = ({ onNewFile, onOpenFile }: EmptyStateProps) => {
  return (
    <div className="size-full flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <div className="space-y-2">
          <h2 className="text-2xl font-medium text-foreground">No file open</h2>
          <p className="text-muted-foreground">
            Create a new file or open an existing one to get started
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onNewFile}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            New File
          </button>
          <button
            onClick={onOpenFile}
            className="px-4 py-2 border border-border bg-background rounded-md hover:bg-accent transition-colors"
          >
            Open File
          </button>
        </div>
      </div>
    </div>
  );
};
