
import type { ProjectFile } from '@/lib/types';

export interface FileTreeNode {
  name: string;
  path: string;
  kind: 'file' | 'directory';
  children: FileTreeNode[];
  file?: ProjectFile;
}

function compareNodes(a: FileTreeNode, b: FileTreeNode): number {
  if (a.kind !== b.kind) {
    return a.kind === 'directory' ? -1 : 1;
  }

  return a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

/**
 * Build a nested folder tree from imported project files.
 * Directories are inferred from each file's path.
 */
export function buildFileTree(
  input: ProjectFile[] | Record<string, ProjectFile>,
): FileTreeNode[] {
  const files = Array.isArray(input) ? input : Object.values(input);

  const root: FileTreeNode[] = [];

  const directoryMap = new Map<string, FileTreeNode>();

  for (const file of files) {
    const normalizedPath = file.path
      .replace(/\\/g, '/')
      .replace(/^\/+/, '');

    const parts = normalizedPath.split('/').filter(Boolean);

    if (
      parts.length === 0 ||
      parts.some((part) => part === '.' || part === '..')
    ) {
      continue;
    }

    let currentChildren = root;
    let currentPath = '';

    for (let index = 0; index < parts.length; index += 1) {
      const part = parts[index];
      const isFile = index === parts.length - 1;

      currentPath = currentPath
        ? `${currentPath}/${part}`
        : part;

      if (isFile) {
        const existingFile = currentChildren.find(
          (node) =>
            node.kind === 'file' &&
            node.name === part,
        );

        if (existingFile) {
          existingFile.file = file;
          existingFile.path = normalizedPath;
        } else {
          currentChildren.push({
            name: part,
            path: normalizedPath,
            kind: 'file',
            children: [],
            file,
          });
        }

        continue;
      }

      let directory = directoryMap.get(currentPath);

      if (!directory) {
        directory = {
          name: part,
          path: currentPath,
          kind: 'directory',
          children: [],
        };

        directoryMap.set(currentPath, directory);
        currentChildren.push(directory);
      }

      currentChildren = directory.children;
    }
  }

  function sortTree(nodes: FileTreeNode[]): void {
    nodes.sort(compareNodes);

    for (const node of nodes) {
      if (node.kind === 'directory') {
        sortTree(node.children);
      }
    }
  }

  sortTree(root);

  return root;
}

/**
 * Find a file or directory in the tree using its relative path.
 */
export function findTreeNode(
  tree: FileTreeNode[],
  targetPath: string,
): FileTreeNode | null {
  const normalizedTarget = targetPath
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  for (const node of tree) {
    if (node.path === normalizedTarget) {
      return node;
    }

    if (node.kind === 'directory') {
      const found = findTreeNode(node.children, normalizedTarget);

      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * Return the file extension in lowercase, without the dot.
 */
export function getFileExtension(filePath: string): string {
  const filename = filePath.split('/').pop() ?? '';
  const dotIndex = filename.lastIndexOf('.');

  if (dotIndex <= 0 || dotIndex === filename.length - 1) {
    return '';
  }

  return filename.slice(dotIndex + 1).toLowerCase();
}

/**
 * Check whether a project file can be edited as text.
 */
export function isEditableFile(file: ProjectFile): boolean {
  return typeof file.content === 'string';
}

/**
 * Count all files and folders in a tree.
 */
export function countTreeItems(
  nodes: FileTreeNode[],
): { files: number; folders: number } {
  let files = 0;
  let folders = 0;

  for (const node of nodes) {
    if (node.kind === 'file') {
      files += 1;
    } else {
      folders += 1;

      const nested = countTreeItems(node.children);
      files += nested.files;
      folders += nested.folders;
    }
  }

  return { files, folders };
}
