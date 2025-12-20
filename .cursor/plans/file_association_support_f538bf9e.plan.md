---
name: File Association Support
overview: Configure Tauri app to register as a file handler for Markdown files and handle file paths when opened from the system file manager
todos:
  - id: configure-file-associations
    content: Add fileAssociations configuration to tauri.conf.json for .md files
    status: completed
  - id: handle-file-events-rust
    content: Implement file open event handler in lib.rs to emit events to frontend
    status: completed
  - id: listen-file-events-frontend
    content: Add event listener in App.tsx to receive file paths and call loadFileFromPath
    status: completed
  - id: test-file-association
    content: Build and test that ecrit appears in Open With dialog and opens files correctly
    status: pending
---

# File Association Support for Markdown Files

## Problem

The `ecrit` application doesn't appear in the system's "Open With" dialog for `.md` files because:

1. No file association is configured in Tauri
2. The app doesn't handle command-line arguments (file paths) when launched with a file
3. No event listener exists to receive file paths from the system

## Solution Overview

### 1. Configure File Associations in `tauri.conf.json`

Add file association configuration to register the app as a Markdown editor:

- Add `fileAssociations` array under `bundle` section
- Configure for `.md` extension with `text/markdown` MIME type
- Set role as "Editor"

### 2. Handle File Open Events in Rust (`src-tauri/src/lib.rs`)

- Listen for the `tauri::event::WindowEvent::FileDrop` or use Tauri's file open event handler
- For Tauri v2, use the `on_window_event` handler to catch file open requests
- Emit a custom event to the frontend with the file path

### 3. Listen for File Open Events in Frontend (`src/App.tsx`)

- Import `listen` from `@tauri-apps/api/event`
- Add `useEffect` to listen for file open events on app mount
- Call `loadFileFromPath` from `useFiles` hook when a file path is received
- Ensure `loadFileFromPath` is destructured from `useFiles` hook

### 4. Handle Multiple Scenarios

- App already running: receive event and open file
- App not running: handle file path from command-line arguments (Tauri handles this automatically via file association)

## Files to Modify

1. **`src-tauri/tauri.conf.json`**

- Add `fileAssociations` configuration under `bundle`

2. **`src-tauri/src/lib.rs`**

- Add event handler for file open events
- Emit custom event to frontend with file path

3. **`src/App.tsx`**

- Import Tauri event API
- Add event listener for file open events
- Destructure `loadFileFromPath` from `useFiles`
- Call `loadFileFromPath` when event received

## Implementation Details

### File Association Configuration

```json
"bundle": {
  "fileAssociations": [
    {
      "ext": ["md"],
      "mimeType": "text/markdown",
      "name": "Markdown File",
      "role": "Editor"
    }
  ]
}
```



### Rust Event Handling

Tauri v2 provides file open events through the window event system. We'll need to:

- Use `on_window_event` to catch file drop/open events
- Extract file paths from the event
- Emit a custom event to the frontend

### Frontend Event Listening

- Use `listen` from `@tauri-apps/api/event` to listen for custom "file-open" events
- Parse the file path from the event payload
- Call `loadFileFromPath(path)` to open the file

## Testing

After implementation:

1. Build the app (`bun run tauri build`)
2. Install the built app
3. Right-click a `.md` file → "Open With" → `ecrit` should appear