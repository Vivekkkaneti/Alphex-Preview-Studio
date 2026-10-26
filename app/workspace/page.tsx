
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import {
  ArrowDownToLine,
  ArrowLeft,
  Check,
  ChevronDown,
  Code2,
  File as FileIconGlyph,
  FileCode2,
  FileImage,
  FileJson,
  Folder,
  FolderOpen,
  Laptop,
  LoaderCircle,
  Maximize2,
  Menu,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
  Upload,
  X,
} from 'lucide-react';

import {
  listSavedProjects,
  openSavedProject,
  updateSavedProject,
} from '@/lib/session';
import type { ProjectFile, ProjectSession } from '@/lib/types';

type Device = 'desktop' | 'tablet' | 'mobile';

type TreeNode = {
  name: string;
  path: string;
  children: TreeNode[];
  isDirectory: boolean;
};

const DEVICE_WIDTHS: Record<Device, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 390,
};

const DEVICE_LABELS: Record<Device, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
};

function isTextFile(path: string) {
  return /\.(html?|css|js|mjs|cjs|jsx|tsx?|json|md|txt|xml|svg|ya?ml|toml|sh|py|java|sql|env|gitignore|tsconfig)$/i.test(path);
}

function getMimeType(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase();

  const types: Record<string, string> = {
    html: 'text/html',
    htm: 'text/html',
    css: 'text/css',
    js: 'text/javascript',
    mjs: 'text/javascript',
    json: 'application/json',
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    ico: 'image/x-icon',
    txt: 'text/plain',
    md: 'text/markdown',
    xml: 'application/xml',
    pdf: 'application/pdf',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    otf: 'font/otf',
  };

  return types[extension ?? ''] ?? 'application/octet-stream';
}

function getContent(file: ProjectFile): string {
  if (typeof file.content === 'string') return file.content;
  return new TextDecoder().decode(file.content);
}
