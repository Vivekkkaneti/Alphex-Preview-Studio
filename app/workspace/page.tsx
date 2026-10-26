
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
  File,
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

function makeTree(files: Record<string, ProjectFile>): TreeNode[] {
  const root: TreeNode[] = [];

  Object.keys(files)
    .sort((a, b) => a.localeCompare(b))
    .forEach((path) => {
      const parts = path.split('/').filter(Boolean);
      let current = root;
      let fullPath = '';

      parts.forEach((part, index) => {
        fullPath = fullPath ? `${fullPath}/${part}` : part;

        let node = current.find((item) => item.name === part);

        if (!node) {
          node = {
            name: part,
            path: fullPath,
            children: [],
            isDirectory: index < parts.length - 1,
          };
          current.push(node);
        }

        current = node.children;
      });
    });

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });

    nodes.forEach((node) => sortNodes(node.children));
  };

  sortNodes(root);
  return root;
}

function getEntryPath(project: ProjectSession): string {
  const paths = Object.keys(project.files);

  const preferred = [
    project.entryHtml,
    'index.html',
    'public/index.html',
    'src/index.html',
    'src/main.html',
  ];

  return (
    preferred.find((path) => paths.includes(path)) ??
    paths.find((path) => /\.html?$/i.test(path)) ??
    ''
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getPreviewHtml(project: ProjectSession, entryPath: string): string {
  const entry = project.files[entryPath];

  if (!entry) {
    return '<!doctype html><html><body style="font-family:Arial;padding:40px"><h2>No HTML entry file found</h2><p>Select an HTML file from the explorer.</p></body></html>';
  }

  let html = getContent(entry);

  const baseDirectory = entryPath.includes('/')
    ? entryPath.slice(0, entryPath.lastIndexOf('/') + 1)
    : '';

  const resolvePath = (reference: string) => {
    const clean = reference.split(/[?#]/)[0];

    if (
      !clean ||
      /^(?:https?:|data:|blob:|\/\/|#|mailto:|tel:|javascript:)/i.test(
        reference.trim(),
      )
    ) {
      return reference;
    }

    const decoded = clean.replace(/^\.\//, '');
    const candidates = [
      decoded,
      `${baseDirectory}${decoded}`,
      decoded.startsWith('/') ? decoded.slice(1) : '',
    ].filter(Boolean);

    const found = candidates.find((candidate) => project.files[candidate]);

    return found ? `alphex-file://${encodeURIComponent(found)}` : reference;
  };

  html = html.replace(
    /\b(src|href)=("([^"]*)"|'([^']*)')/gi,
    (_match, attribute: string, _quoted: string, double: string, single: string) => {
      const value = double ?? single ?? '';
      return `${attribute}="${escapeHtml(resolvePath(value))}"`;
    },
  );

  const fileMap: Record<string, string> = {};

  Object.entries(project.files).forEach(([path, file]) => {
    if (typeof file.content === 'string') {
      fileMap[path] = file.content;
      return;
    }

    const bytes = file.content;
    let binary = '';
    const chunkSize = 8192;

    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(
        ...Array.from(bytes.slice(index, index + chunkSize)),
      );
    }

    fileMap[path] =
      `data:${file.mimeType || getMimeType(path)};base64,${btoa(binary)}`;
  });

  const serializedFiles = JSON.stringify(fileMap).replace(/</g, '\\u003c');

  const bridge = `
<script>
(() => {
  const files = ${serializedFiles};

  const normalize = (path) => {
    const parts = [];
    for (const item of path.split('/')) {
      if (!item || item === '.') continue;
      if (item === '..') parts.pop();
      else parts.push(item);
    }
    return parts.join('/');
  };

  const resolve = (url) => {
    if (!url || /^(https?:|data:|blob:|\\/\\/|#|mailto:|tel:|javascript:)/i.test(url)) return url;

    const clean = decodeURIComponent(
      url.replace(/^alphex-file:\\/\\//, '').split(/[?#]/)[0]
    );

    if (files[clean] !== undefined) return files[clean];
    return url;
  };

  document.querySelectorAll('[src], [href]').forEach((element) => {
    ['src', 'href'].forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;

      const value = element.getAttribute(attribute);

      if (value && value.startsWith('alphex-file://')) {
        const result = resolve(value);
        if (result) element.setAttribute(attribute, result);
      }
    });
  });

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    const key = normalize(url.split(/[?#]/)[0]);

    if (files[key] !== undefined) {
      return Promise.resolve(
        new Response(files[key], {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        })
      );
    }

    return originalFetch(input, init);
  };
})();
</script>`;

  if (/<\/body\s*>/i.test(html)) {
    return html.replace(/<\/body\s*>/i, `${bridge}</body>`);
  }

  return `${html}${bridge}`;
}

function FileIcon({ path }: { path: string }) {
  const extension = path.split('.').pop()?.toLowerCase();

  if (extension === 'html' || extension === 'htm') {
    return <FileCode2 size={15} className="shrink-0 text-orange-500" />;
  }

  if (extension === 'css') {
    return <FileCode2 size={15} className="shrink-0 text-blue-500" />;
  }

  if (['js', 'ts', 'tsx', 'jsx', 'json'].includes(extension ?? '')) {
    return <FileJson size={15} className="shrink-0 text-amber-500" />;
  }

  if (
    ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(extension ?? '')
  ) {
    return <FileImage size={15} className="shrink-0 text-violet-500" />;
  }

  return <File size={15} className="shrink-0 text-stone-400" />;
}

export default function WorkspacePage() {
  const [project, setProject] = useState<ProjectSession | null>(null);
  const [recentProjects, setRecentProjects] = useState<ProjectSession[]>([]);
  const [selectedPath, setSelectedPath] = useState('');
  const [draft, setDraft] = useState('');
  const [device, setDevice] = useState<Device>('desktop');
  const [showEditor, setShowEditor] = useState(true);
  const [showFileTree, setShowFileTree] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['public', 'src']),
  );
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const tree = useMemo(
    () => (project ? makeTree(project.files) : []),
    [project],
  );

  const selectedFile = project?.files[selectedPath];

  const entryPath = useMemo(
    () => (project ? getEntryPath(project) : ''),
    [project],
  );

  const previewHtml = useMemo(
    () => (project && entryPath ? getPreviewHtml(project, entryPath) : ''),
    [project, entryPath],
  );

  const fileCount = project ? Object.keys(project.files).length : 0;

  const refreshRecentProjects = useCallback(async () => {
    try {
      const recent = await listSavedProjects();
      setRecentProjects(recent);
    } catch {
      // IndexedDB may be unavailable in private browsing.
    }
  }, []);

  const openProject = useCallback(async (id: string) => {
    setBusy(true);
    setError('');
    setMessage('');

    try {
      const loaded = await openSavedProject(id);

      if (!loaded) {
        setError('That project could not be opened.');
        return;
      }

      setProject(loaded);
      setSelectedPath(getEntryPath(loaded));
      setExpandedFolders(new Set(['public', 'src']));
      setSaved(true);
      setMessage(`Opened ${loaded.name}`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Unable to open this project.',
      );
    } finally {
      setBusy(false);
    }
  }, []);

  const importArchive = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setError('Please select a ZIP archive.');
        return;
      }

      setBusy(true);
      setError('');
      setMessage('');

      try {
        const zip = await JSZip.loadAsync(file, { checkCRC32: true });

        const entries = Object.values(zip.files).filter(
          (item) =>
            !item.dir &&
            !/(^|\/)(node_modules|\.git|\.next|dist|build)\/|(^|\/)__MACOSX\//i.test(
              item.name,
            ) &&
            !item.name.endsWith('.DS_Store'),
        );

        if (entries.length === 0) {
          throw new Error('This ZIP does not contain any usable project files.');
        }

        if (entries.length > 2000) {
          throw new Error('This ZIP contains too many files. The limit is 2,000.');
        }

        const files: Record<string, ProjectFile> = {};
        let totalBytes = 0;

        for (const entry of entries) {
          const path = entry.name.replace(/^\.\/+/, '').replace(/\\/g, '/');

          if (!path || path.split('/').some((part) => part === '..')) {
            continue;
          }

          const data = await entry.async('uint8array');
          totalBytes += data.byteLength;

          if (totalBytes > 100 * 1024 * 1024) {
            throw new Error('The extracted project is over the 100 MB limit.');
          }

          const content: string | Uint8Array = isTextFile(path)
            ? new TextDecoder('utf-8').decode(data)
            : data;

          files[path] = {
            path,
            name: path.split('/').pop() ?? path,
            kind: 'file',
            content,
            mimeType: getMimeType(path),
            size: data.byteLength,
            lastModified: Date.now(),
          };
        }

        const paths = Object.keys(files);

        const htmlEntry =
          paths.find((path) => path === 'index.html') ??
          paths.find((path) => /\/index\.html$/i.test(path)) ??
          paths.find((path) => /\.html?$/i.test(path));

        if (!htmlEntry) {
          throw new Error(
            'No HTML entry file was found. Import a static website containing an index.html file.',
          );
        }

        const now = Date.now();
        const name = file.name.replace(/\.zip$/i, '') || 'Imported project';

        const newProject: ProjectSession = {
          id: `project-${now}-${Math.random().toString(36).slice(2, 8)}`,
          name,
          files,
          entryHtml: htmlEntry,
          projectType: 'static',
          runtimeStatus: 'static-preview',
          createdAt: now,
          updatedAt: now,
        };

        await updateSavedProject(newProject);

        setProject(newProject);
        setSelectedPath(htmlEntry);
        setExpandedFolders(new Set(['public', 'src']));
        setSaved(true);
        setMessage(`Imported ${name}`);

        await refreshRecentProjects();
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : 'Unable to import this ZIP.',
        );
      } finally {
        setBusy(false);
      }
    },
    [refreshRecentProjects],
  );

  useEffect(() => {
    let cancelled = false;

    async function initialise() {
      try {
        const recent = await listSavedProjects();

        if (cancelled) return;
        setRecentProjects(recent);

        const pendingData = sessionStorage.getItem('alphex-pending-project');
        const pendingName = sessionStorage.getItem('alphex-pending-project-name');

        if (pendingData) {
          sessionStorage.removeItem('alphex-pending-project');
          sessionStorage.removeItem('alphex-pending-project-name');

          const response = await fetch(pendingData);
          const blob = await response.blob();

          const file = new File(
            [blob],
            pendingName || 'Imported project.zip',
            { type: 'application/zip' },
          );

          if (!cancelled) await importArchive(file);
          return;
        }

        if (recent.length > 0 && !cancelled) {
          const loaded = await openSavedProject(recent[0].id);

          if (!cancelled && loaded) {
            setProject(loaded);
            setSelectedPath(getEntryPath(loaded));
          }
        }
      } catch (reason) {
        if (!cancelled) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'Workspace initialisation failed.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void initialise();

    return () => {
      cancelled = true;
    };
  }, [importArchive]);

  useEffect(() => {
    setDraft(selectedFile ? getContent(selectedFile) : '');
  }, [selectedPath, selectedFile]);

  const saveCurrentFile = useCallback(async () => {
    if (!project || !selectedPath || !selectedFile) return;

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const updatedFile: ProjectFile = {
        ...selectedFile,
        content: draft,
        size: new TextEncoder().encode(draft).byteLength,
        lastModified: Date.now(),
      };

      const updatedProject: ProjectSession = {
        ...project,
        files: {
          ...project.files,
          [selectedPath]: updatedFile,
        },
        updatedAt: Date.now(),
      };

      await updateSavedProject(updatedProject);

      setProject(updatedProject);
      setSaved(true);
      setMessage('Changes saved');
    } catch (reason) {
      setSaved(false);
      setError(
        reason instanceof Error ? reason.message : 'Unable to save changes.',
      );
    } finally {
      setBusy(false);
    }
  }, [project, selectedPath, selectedFile, draft]);

  const exportProject = useCallback(async () => {
    if (!project) return;

    setBusy(true);
    setError('');

    try {
      const zip = new JSZip();

      Object.values(project.files).forEach((item) => {
        zip.file(item.path, item.content);
      });

      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = `${
        project.name.replace(/[^\w.-]+/g, '-') || 'project'
      }.zip`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage('Project ZIP exported');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Export failed.');
    } finally {
      setBusy(false);
    }
  }, [project]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((previous) => {
      const next = new Set(previous);

      if (next.has(path)) next.delete(path);
      else next.add(path);

      return next;
    });
  };

  const renderTree = (
    nodes: TreeNode[],
    depth = 0,
  ): React.ReactNode =>
    nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = selectedPath === node.path;

      return (
        <div key={node.path}>
          <button
            type="button"
            onClick={() => {
              if (node.isDirectory) toggleFolder(node.path);
              else setSelectedPath(node.path);
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] transition ${
              isSelected
                ? 'bg-amber-100 text-stone-950'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
            style={{ paddingLeft: `${10 + depth * 13}px` }}
            title={node.path}
          >
            {node.isDirectory ? (
              <>
                {isExpanded ? (
                  <FolderOpen size={15} className="shrink-0 text-amber-600" />
                ) : (
                  <Folder size={15} className="shrink-0 text-amber-600" />
                )}
                <span className="min-w-0 flex-1 truncate">{node.name}</span>
                <ChevronDown
                  size={12}
                  className={`shrink-0 transition-transform ${
                    isExpanded ? '' : '-rotate-90'
                  }`}
                />
              </>
            ) : (
              <>
                <FileIcon path={node.path} />
                <span className="min-w-0 flex-1 truncate">{node.name}</span>
              </>
            )}
          </button>

          {node.isDirectory && isExpanded && (
            <div>{renderTree(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });

  const chooseProject = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    if (event.target.value) await openProject(event.target.value);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] text-stone-600">
        <div className="flex items-center gap-3 text-sm">
          <LoaderCircle size={19} className="animate-spin text-amber-500" />
          Preparing your workspace…
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen min-h-[600px] flex-col overflow-hidden bg-[#faf9f6] text-[#191b19]">
      <header className="z-20 flex h-[62px] shrink-0 items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            aria-label="Back to home"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition hover:bg-stone-50"
          >
            <ArrowLeft size={17} />
          </Link>

          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold tracking-[-0.02em]">
              Alphex <span className="text-amber-600">Preview Studio</span>
            </div>
            <div className="mt-0.5 text-[10px] text-stone-400">
              Local project workspace
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          {project && (
            <div className="hidden min-w-0 items-center gap-2 md:flex">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  saved ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="max-w-[150px] truncate text-xs text-stone-500">
                {saved ? 'Saved locally' : 'Unsaved changes'}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-xs font-medium transition hover:bg-stone-50 disabled:opacity-50 sm:px-4"
          >
            <Upload size={14} />
            <span className="hidden sm:inline">Import ZIP</span>
            <span className="sm:hidden">Import</span>
          </button>

          <button
            type="button"
            onClick={exportProject}
            disabled={!project || busy}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#ffcc14] px-3 text-xs font-semibold text-stone-950 transition hover:bg-[#f2bd00] disabled:opacity-50 sm:px-4"
          >
            <ArrowDownToLine size={14} />
            <span className="hidden sm:inline">Export ZIP</span>
            <span className="sm:hidden">Export</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importArchive(file);
              event.target.value = '';
            }}
          />
        </div>
      </header>

      {(error || message) && (
        <div
          role={error ? 'alert' : 'status'}
          className={`flex min-h-10 shrink-0 items-center justify-between gap-3 border-b px-4 py-2 text-xs ${
            error
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-100 bg-emerald-50 text-emerald-800'
          }`}
        >
          <span className="min-w-0">{error || message}</span>
          <button
            type="button"
            onClick={() => {
              setError('');
              setMessage('');
            }}
            aria-label="Dismiss message"
            className="shrink-0 rounded p-1 hover:bg-black/5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {showFileTree && (
          <aside className="hidden w-[235px] shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
            <div className="border-b border-stone-100 px-4 py-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Project
                </span>
                <button
                  type="button"
                  onClick={() => void refreshRecentProjects()}
                  className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                  title="Refresh projects"
                >
                  <RefreshCw size={13} />
                </button>
              </div>

              {recentProjects.length > 0 ? (
                <select
                  value={project?.id ?? ''}
                  onChange={chooseProject}
                  className="w-full truncate rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 text-xs outline-none focus:border-amber-400"
                  aria-label="Choose saved project"
                >
                  {!project && <option value="">Choose project</option>}
                  {recentProjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-stone-500">No saved projects yet</p>
              )}

              {project && (
                <div className="mt-3 flex items-center justify-between text-[10px] text-stone-400">
                  <span>{fileCount} files</span>
                  <span className="max-w-[115px] truncate">{project.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                Explorer
              </span>
              <Code2 size={14} className="text-stone-400" />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-5">
              {project ? (
                renderTree(tree)
              ) : (
                <div className="px-3 py-6 text-xs leading-5 text-stone-400">
                  Import a ZIP file to browse its files.
                </div>
              )}
            </div>

            <div className="border-t border-stone-100 px-4 py-3 text-[10px] text-stone-400">
              Files are stored in this browser.
            </div>
          </aside>
        )}

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-[53px] shrink-0 flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-white px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowFileTree((value) => !value)}
                className="hidden h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 lg:flex"
                title={showFileTree ? 'Hide file explorer' : 'Show file explorer'}
              >
                <Menu size={16} />
              </button>

              <div className="min-w-0">
                <div className="truncate text-xs font-medium">
                  {project?.name ?? 'Untitled project'}
                </div>
                <div className="truncate text-[10px] text-stone-400">
                  {selectedPath || 'No file selected'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 p-1">
              {(
                [
                  ['desktop', Monitor],
                  ['tablet', Tablet],
                  ['mobile', Smartphone],
                ] as const
              ).map(([value, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDevice(value)}
                  aria-label={`${DEVICE_LABELS[value]} preview`}
                  title={DEVICE_LABELS[value]}
                  className={`flex h-7 w-8 items-center justify-center rounded-lg transition ${
                    device === value
                      ? 'bg-white text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => frameRef.current?.contentWindow?.location.reload()}
                disabled={!project}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 disabled:opacity-40"
                title="Refresh preview"
              >
                <RefreshCw size={14} />
              </button>

              <button
                type="button"
                onClick={() => setShowEditor((value) => !value)}
                className={`hidden h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] transition sm:flex ${
                  showEditor
                    ? 'bg-amber-50 text-stone-800'
                    : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                <Code2 size={13} />
                Editor
              </button>
            </div>
          </div>

          <div
            className={`grid min-h-0 flex-1 ${
              showEditor
                ? 'grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'
                : 'grid-cols-1'
            }`}
          >
            {showEditor && (
              <section className="flex min-h-0 flex-col border-b border-stone-200 bg-[#fcfbf8] xl:border-b-0 xl:border-r">
                <div className="flex h-10 shrink-0 items-center justify-between border-b border-stone-200 px-4">
                  <div className="flex min-w-0 items-center gap-2">
                    {selectedPath ? (
                      <FileIcon path={selectedPath} />
                    ) : (
                      <Code2 size={14} className="text-stone-400" />
                    )}

                    <span className="max-w-[240px] truncate text-[11px] font-medium text-stone-600">
                      {selectedPath || 'Select a file'}
                    </span>

                    {selectedFile && !isTextFile(selectedPath) && (
                      <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[9px] text-stone-500">
                        Read-only
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={saveCurrentFile}
                    disabled={
                      !project ||
                      !selectedFile ||
                      !isTextFile(selectedPath) ||
                      busy ||
                      draft === getContent(selectedFile)
                    }
                    className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-[#ffcc14] px-2.5 text-[10px] font-semibold text-stone-950 transition hover:bg-[#f2bd00] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Check size={12} />
                    Save
                  </button>
                </div>

                {selectedFile && isTextFile(selectedPath) ? (
                  <textarea
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      setSaved(false);
                    }}
                    spellCheck={false}
                    aria-label={`Edit ${selectedPath}`}
                    className="min-h-0 flex-1 resize-none border-0 bg-transparent p-4 font-mono text-[12px] leading-[1.8] text-stone-800 outline-none focus:ring-0"
                  />
                ) : selectedFile ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                    <FileImage size={28} className="text-stone-300" />
                    <div className="text-xs font-medium text-stone-600">
                      Preview-only file
                    </div>
                    <p className="max-w-xs text-[11px] leading-5 text-stone-400">
                      This file is included in your project but cannot be edited in the text editor.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                    <Code2 size={28} className="text-stone-300" />
                    <div className="text-xs font-medium text-stone-600">
                      Your code lives here
                    </div>
                    <p className="max-w-xs text-[11px] leading-5 text-stone-400">
                      Select a file in the explorer to inspect and edit its contents.
                    </p>
                  </div>
                )}

                <div className="flex h-8 shrink-0 items-center justify-between border-t border-stone-200 px-4 text-[10px] text-stone-400">
                  <span>
                    {selectedFile
                      ? `${draft.length} characters`
                      : 'No file selected'}
                  </span>
                  <span>UTF-8</span>
                </div>
              </section>
            )}

            <section className="flex min-h-0 flex-col bg-[#eeede9]">
              <div className="flex h-10 shrink-0 items-center justify-between border-b border-stone-200 bg-white/80 px-3 sm:px-4">
                <div className="flex items-center gap-2 text-[11px] font-medium text-stone-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                    <Laptop size={12} />
                  </span>
                  Live preview
                  <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[9px] text-stone-500">
                    {DEVICE_LABELS[device]}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (frameRef.current) {
                      void frameRef.current.requestFullscreen?.();
                    }
                  }}
                  disabled={!project}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 disabled:opacity-40"
                  title="Fullscreen preview"
                >
                  <Maximize2 size={13} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
                {project && entryPath ? (
                  <div
                    className="mx-auto h-full min-h-[280px] transition-[width] duration-200"
                    style={{ width: `min(100%, ${DEVICE_WIDTHS[device]}px)` }}
                  >
                    <div className="flex h-full min-h-[280px] flex-col overflow-hidden rounded-xl border border-stone-300 bg-white shadow-[0_8px_30px_rgba(20,20,20,0.06)]">
                      <div className="flex h-8 shrink-0 items-center gap-1.5 border-b border-stone-200 bg-white px-3">
                        <span className="h-2 w-2 rounded-full bg-[#f28b82]" />
                        <span className="h-2 w-2 rounded-full bg-[#fbbc04]" />
                        <span className="h-2 w-2 rounded-full bg-[#81c995]" />
                        <div className="mx-auto max-w-[65%] truncate rounded-md bg-stone-100 px-4 py-1 text-[9px] text-stone-400">
                          {selectedPath || entryPath}
                        </div>
                      </div>

                      <iframe
                        ref={frameRef}
                        title="Website preview"
                        srcDoc={previewHtml}
                        sandbox="allow-scripts allow-forms allow-modals allow-popups"
                        className="min-h-0 w-full flex-1 border-0 bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white/70 px-6 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <Upload size={24} />
                    </div>

                    <h2 className="text-base font-semibold tracking-tight">
                      Bring your project to life
                    </h2>

                    <p className="mt-2 max-w-sm text-xs leading-5 text-stone-500">
                      Import a website ZIP to inspect its files and preview its HTML in a responsive workspace.
                    </p>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={busy}
                      className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#ffcc14] px-4 text-xs font-semibold text-stone-950 transition hover:bg-[#f2bd00] disabled:opacity-50"
                    >
                      <Upload size={14} />
                      Import project ZIP
                    </button>

                    <p className="mt-3 text-[10px] text-stone-400">
                      HTML, CSS, JavaScript and assets
                    </p>
                  </div>
                )}
              </div>

              <div className="flex h-8 shrink-0 items-center justify-between border-t border-stone-200 bg-white px-3 sm:px-4">
                <span className="truncate text-[10px] text-stone-400">
                  {project
                    ? `${fileCount} files · ${entryPath || 'No entry file'}`
                    : 'No project loaded'}
                </span>

                <span className="ml-3 flex shrink-0 items-center gap-1.5 text-[10px] text-stone-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Browser preview
                </span>
              </div>
            </section>
          </div>
        </section>
      </div>

      {busy && (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-600 shadow-lg">
          <LoaderCircle size={15} className="animate-spin text-amber-500" />
          Working on your project…
        </div>
      )}
    </main>
  );
}
