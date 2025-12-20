---
name: File Management and History
overview: Add note saving, opening, and history tracking features. Files will be managed in a sidebar list, saved to a default directory, and history will track file paths for restoration on app startup.
todos:
  - id: install-plugins
    content: Install @tauri-apps/plugin-dialog and @tauri-apps/plugin-fs packages
    status: pending
  - id: update-cargo
    content: Add Tauri plugins to Cargo.toml dependencies
    status: pending
  - id: create-file-manager
    content: Create src/lib/file-manager.ts with save/open/list functions
    status: pending
  - id: create-history
    content: Create src/lib/history.ts for history persistence
    status: pending
  - id: create-use-files
    content: Create src/hooks/use-files.ts for file state management
    status: pending
  - id: update-sidebar
    content: Update sidebar.tsx to show file list with open/save buttons
    status: pending
  - id: update-editor
    content: Update editor/index.tsx to handle file state and save shortcut
    status: pending
  - id: update-app
    content: Update App.tsx to use useFiles hook and load history on mount
    status: pending
---

# File Management and History Implementation

## Architecture Overview

The implementation will add:

1. **File Management System**: Save/open notes with file dialogs
2. **Sidebar File List**: Display all open files in the sidebar
3. **History Tracking**: Persist file paths to restore on app startup
4. **Default Directory**: Use a default notes directory (~/Documents/ecrit or app data dir)

## Implementation Steps

### 1. Install Required Tauri Plugins

Add to `package.json`:

- `@tauri-apps/plugin-dialog` - File dialogs (save/open)
- `@tauri-apps/plugin-fs` - File system operations

Update `src-tauri/Cargo.toml` to include these plugins.

### 2. Create File Management Utilities

**File: `src/lib/file-manager.ts`**

- `saveFile(content: string, path?: string)` - Save file (prompt if no path)
- `openFile()` - Open file dialog and read content
- `getDefaultNotesDir()` - Get/create default notes directory
- `listFilesInDir(dir: string)` - List all markdown files in directory

### 3. Create History Management

**File: `src/lib/history.ts`**

- `saveHistory(files: string[])` - Save file paths to JSON in app data dir
- `loadHistory()` - Load file paths from history
- `addToHistory(path: string)` - Add file to history
- `removeFromHistory(path: string)` - Remove file from history

Use Tauri's `appDataDir` for storing history JSON file.

### 4. Create File State Management Hook

**File: `src/hooks/use-files.ts`**

- Manage array of open files with their paths and content
- Track current active file
- Handle file operations (open, save, close, switch)
- Auto-save on file switch
- Load history on mount

### 5. Update Sidebar Component

**File: `src/components/sidebar.tsx`**

- Display list of open files
- Show current active file (highlighted)
- Add buttons: "New File", "Open File", "Save File"
- Click file to switch to it
- Close button for each file

### 6. Update Editor Component

**File: `src/components/editor/index.tsx`**

- Accept `currentFile` prop from parent
- Update `Writer` to show file path/name in title
- Handle save keyboard shortcut (Cmd/Ctrl+S)
- Show "unsaved" indicator if file has changes

### 7. Update App Component

**File: `src/App.tsx`**

- Use `useFiles` hook to manage file state
- Pass current file to Editor
- Load history on mount and restore file paths
- Save history on file changes

### 8. Add Tauri Commands (if needed)

**File: `src-tauri/src/lib.rs`**

- Optional: Add Rust commands for file operations if needed for better performance

## File Structure

```javascript
src/
├── lib/
│   ├── file-manager.ts      # File I/O operations
│   └── history.ts            # History persistence
├── hooks/
│   └── use-files.ts          # File state management
└── components/
    ├── sidebar.tsx            # Updated with file list
    └── editor/
        └── index.tsx          # Updated to handle file state
```



## Data Flow

```javascript
App (useFiles hook)
  ├─> Load history on mount
  ├─> Manage file list state
  └─> Save history on changes
       │
       ├─> Sidebar (displays files, handles open/save)
       │   └─> file-manager.ts (Tauri file dialogs)
       │
       └─> Editor (displays current file content)
           └─> Writer (edits content)
```