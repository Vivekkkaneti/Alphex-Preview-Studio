
export type ThemeMode = 'light' | 'dark';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type ProjectFileKind = 'file' | 'directory';

export type RuntimeStatus =
  | 'idle'
  | 'ready'
  | 'running'
  | 'stopped'
  | 'error'
  | 'static-preview';

export type ProjectType =
  | 'static'
  | 'html'
  | 'react'
  | 'nextjs'
  | 'javascript'
  | 'unknown';

export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export type FileContent = string | Uint8Array;

export interface ProjectFile {
  path: string;
  name: string;
  kind: ProjectFileKind;
  content: FileContent;
  mimeType: string;
  size: number;
  lastModified: number;
}

export interface ProjectSession {
  id: string;
  name: string;
  files: Record<string, ProjectFile>;
  entryHtml: string;
  projectType: ProjectType;
  runtimeStatus: RuntimeStatus;
  createdAt: number;
  updatedAt: number;
}

export interface PreviewLog {
  id: string;
  time: string;
  level: LogLevel;
  message: string;
  source?: string;
}

export interface RecentProject {
  id: string;
  name: string;
  entry: string;
  importedAt: number;
  fileCount: number;
}

export interface DeviceDimensions {
  width: number;
  label: string;
}
