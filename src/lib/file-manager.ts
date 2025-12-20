import { save, open } from "@tauri-apps/plugin-dialog";
import {
  readTextFile,
  writeTextFile,
  exists,
  mkdir,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import { documentDir, join } from "@tauri-apps/api/path";

export interface FileInfo {
  path: string;
  name: string;
  content: string;
}

export async function getDefaultNotesDir(): Promise<string> {
  const docsDir = await documentDir();
  const notesDir = await join(docsDir, "ecrit");

  try {
    const notesPath = await join(docsDir, "ecrit");
    if (!(await exists(notesPath))) {
      await mkdir("ecrit", {
        baseDir: BaseDirectory.Document,
        recursive: true,
      });
    }
  } catch (error) {
    console.warn("Error creating notes directory:", error);
  }

  return notesDir;
}

export async function saveFile(
  content: string,
  path?: string
): Promise<string | null> {
  try {
    let filePath = path;

    if (!filePath) {
      const defaultDir = await getDefaultNotesDir();
      const selected = await save({
        defaultPath: defaultDir,
        filters: [
          {
            name: "Markdown",
            extensions: ["md"],
          },
        ],
      });

      if (!selected) {
        return null;
      }

      filePath = selected as string;
    }

    if (!filePath.endsWith(".md")) {
      filePath = `${filePath}.md`;
    }

    await writeTextFile(filePath, content);
    return filePath;
  } catch (error) {
    console.error("Error saving file:", error);
    throw error;
  }
}

export async function openFile(): Promise<FileInfo | null> {
  try {
    const defaultDir = await getDefaultNotesDir();
    const selected = await open({
      defaultPath: defaultDir,
      multiple: false,
      filters: [
        {
          name: "Markdown",
          extensions: ["md"],
        },
        {
          name: "All Files",
          extensions: ["*"],
        },
      ],
    });

    if (!selected || Array.isArray(selected)) {
      return null;
    }

    const filePath = selected as string;
    const content = await readTextFile(filePath);

    const pathParts = filePath.split(/[/\\]/);
    const name = pathParts[pathParts.length - 1];

    return {
      path: filePath,
      name,
      content,
    };
  } catch (error) {
    console.error("Error opening file:", error);
    throw error;
  }
}

export async function readFile(path: string): Promise<FileInfo | null> {
  try {
    if (!(await exists(path))) {
      return null;
    }

    const content = await readTextFile(path);
    const pathParts = path.split(/[/\\]/);
    const name = pathParts[pathParts.length - 1];

    return {
      path,
      name,
      content,
    };
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
}

export async function listFilesInDir(dir: string): Promise<FileInfo[]> {
  try {
    const { readDir } = await import("@tauri-apps/plugin-fs");
    const entries = await readDir(dir);
    const files: FileInfo[] = [];

    for (const entry of entries) {
      if (entry.isFile && entry.name?.endsWith(".md")) {
        const filePath = await join(dir, entry.name);
        const content = await readTextFile(filePath);

        files.push({
          path: filePath,
          name: entry.name,
          content,
        });
      }
    }

    return files;
  } catch (error) {
    console.error("Error listing files:", error);
    return [];
  }
}
