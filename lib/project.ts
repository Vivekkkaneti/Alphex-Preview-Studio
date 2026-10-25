
import type { ProjectFile } from '@/lib/types';

const EXCLUDED_NAMES = new Set([
  'node_modules',
  '.git',
  '__MACOSX',
  '.DS_Store',
  '.next',
  'dist',
  'build',
]);

export function normalizePath(path: string): string {
  return path
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^\.\//, '');
}

export function isExcludedPath(path: string): boolean {
  const normalized = normalizePath(path);

  return normalized.split('/').some(
    (part) => part === '..' || part === '.' || EXCLUDED_NAMES.has(part),
  );
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
  const normalized = normalizePath(path);

  if (!normalized || isExcludedPath(normalized)) {
    throw new Error(`Unsupported project file path: ${path}`);
  }

  const mimeType = getMimeType(normalized);
  const textFile = isTextFile(normalized);
  const content = textFile
    ? new TextDecoder().decode(bytes)
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
  return normalizePath(path)
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}
