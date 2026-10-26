
import type { ProjectFile } from '@/lib/types';

export const PROJECT_LIMITS = {
  maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB per file
  maxPathLength: 500,
} as const;

const EXCLUDED_NAMES = new Set([
  'node_modules',
  '.git',
  '__MACOSX',
  '.DS_Store',
  '.next',
  'dist',
  'build',
]);

/**
 * Normalize separators and remove harmless leading "./" segments.
 * Reject traversal and absolute paths separately in validateProjectPath.
 */
export function normalizePath(path: string): string {
  return path
    .replace(/\\/g, '/')
    .replace(/^(?:\.\/)+/, '')
    .replace(/^\/+/, '');
}

export function validateProjectPath(path: string): string {
  if (typeof path !== 'string' || !path.trim()) {
    throw new Error('The project contains an empty file path.');
  }

  if (path.length > PROJECT_LIMITS.maxPathLength) {
    throw new Error('A project file path is too long.');
  }

  // Reject Unix absolute paths, Windows absolute paths, and drive paths.
  if (
    path.startsWith('/') ||
    path.startsWith('\\') ||
    /^[a-zA-Z]:/.test(path)
  ) {
    throw new Error(`Absolute file paths are not allowed: ${path}`);
  }

  const normalized = path.replace(/\\/g, '/');

  // Reject traversal before normalization can hide it.
  if (normalized.split('/').some((part) => part === '..')) {
    throw new Error(`Parent-directory paths are not allowed: ${path}`);
  }

  const safePath = normalizePath(path);

  if (
    !safePath ||
    safePath.split('/').some(
      (part) => !part || part === '.' || EXCLUDED_NAMES.has(part),
    )
  ) {
    throw new Error(`Unsupported project file path: ${path}`);
  }

  return safePath;
}

export function isExcludedPath(path: string): boolean {
  try {
    validateProjectPath(path);
    return false;
  } catch {
    return true;
  }
}

export function getMimeType(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase() ?? '';

  const types: Record<string, string> = {
    html: 'text/html; charset=utf-8',
    htm: 'text/html; charset=utf-8',
    css: 'text/css; charset=utf-8',
    js: 'text/javascript; charset=utf-8',
    mjs: 'text/javascript; charset=utf-8',
    cjs: 'text/javascript; charset=utf-8',
    jsx: 'text/javascript; charset=utf-8',
    ts: 'text/plain; charset=utf-8',
    tsx: 'text/plain; charset=utf-8',
    json: 'application/json; charset=utf-8',
    map: 'application/json; charset=utf-8',
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
    ico: 'image/x-icon',
    txt: 'text/plain; charset=utf-8',
    xml: 'application/xml; charset=utf-8',
    pdf: 'application/pdf',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    otf: 'font/otf',
    md: 'text/markdown; charset=utf-8',
    py: 'text/plain; charset=utf-8',
    sql: 'text/plain; charset=utf-8',
    yml: 'text/plain; charset=utf-8',
    yaml: 'text/plain; charset=utf-8',
  };

  return types[extension] ?? 'application/octet-stream';
}

export function isTextFile(path: string): boolean {
  const mimeType = getMimeType(path);

  return (
    mimeType.startsWith('text/') ||
    mimeType.startsWith('application/json') ||
    mimeType.startsWith('application/xml') ||
    mimeType === 'image/svg+xml'
  );
}

export function createProjectFile(
  path: string,
  bytes: Uint8Array,
  lastModified = Date.now(),
): ProjectFile {
  const normalized = validateProjectPath(path);

  if (bytes.byteLength > PROJECT_LIMITS.maxFileSizeBytes) {
    throw new Error(
      `"${normalized}" exceeds the 10 MB per-file limit.`,
    );
  }

  const mimeType = getMimeType(normalized);
  const textFile = isTextFile(normalized);
  const content = textFile
    ? new TextDecoder('utf-8', { fatal: false }).decode(bytes)
    : new Uint8Array(bytes);

  return {
    path: normalized,
    name: normalized.split('/').pop() || normalized,
    kind: 'file',
    content,
    mimeType,
    size: bytes.byteLength,
    lastModified,
  };
}

export function findEntryHtml(files: ProjectFile[]): string | null {
  const htmlPaths = files
    .filter(
      (file) =>
        file.kind === 'file' && /\.html?$/i.test(file.path),
    )
    .map((file) => file.path);

  return (
    htmlPaths.find((path) => /^index\.html?$/i.test(path)) ??
    htmlPaths.find((path) => /\/index\.html?$/i.test(path)) ??
    htmlPaths[0] ??
    null
  );
}

export function getProjectName(filename: string): string {
  const normalized = filename.replace(/\\/g, '/');
  const lastPart = normalized.split('/').pop() || 'Untitled project';

  return lastPart.replace(/\.zip$/i, '').trim() || 'Untitled project';
}

export function toSafePreviewPath(path: string): string {
  return validateProjectPath(path)
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}
