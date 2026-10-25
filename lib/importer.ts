
import JSZip from 'jszip';

import {
  createProjectFile,
  findEntryHtml,
  getProjectName,
  isExcludedPath,
  normalizePath,
} from '@/lib/project';

import type {
  ProjectFile,
  ProjectSession,
  ProjectType,
} from '@/lib/types';

const MAX_ARCHIVE_SIZE = 50 * 1024 * 1024;
const MAX_EXTRACTED_SIZE = 100 * 1024 * 1024;
const MAX_FILE_COUNT = 2000;

function detectProjectType(files: ProjectFile[]): ProjectType {
  const packageFile = files.find(
    (file) => file.path.toLowerCase() === 'package.json',
  );

  if (packageFile && typeof packageFile.content === 'string') {
    try {
      const packageJson = JSON.parse(packageFile.content) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };

      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (dependencies.next) return 'nextjs';
      if (dependencies.react) return 'react';
    } catch {
      // Continue detection when package.json is invalid.
    }
  }

  if (files.some((file) => /\.(jsx|tsx)$/i.test(file.path))) {
    return 'react';
  }

  if (files.some((file) => /\.(js|mjs|cjs)$/i.test(file.path))) {
    return 'javascript';
  }

  if (findEntryHtml(files)) {
    return 'html';
  }

  return 'unknown';
}

export async function importZipProject(
  archive: File,
): Promise<ProjectSession> {
  if (!archive.name.toLowerCase().endsWith('.zip')) {
    throw new Error('Please select a ZIP archive.');
  }

  if (archive.size > MAX_ARCHIVE_SIZE) {
    throw new Error('The ZIP archive must be 50 MB or smaller.');
  }

  if (archive.size === 0) {
    throw new Error('The selected ZIP archive is empty.');
  }

  let zip: JSZip;

  try {
    zip = await JSZip.loadAsync(archive, {
      checkCRC32: true,
    });
  } catch {
    throw new Error(
      'Could not read this ZIP archive. Check that it is a valid ZIP file.',
    );
  }

  const entries = Object.values(zip.files).filter(
    (entry) =>
      !entry.dir &&
      !isExcludedPath(normalizePath(entry.name)),
  );

  if (entries.length === 0) {
    throw new Error('No usable project files were found in this ZIP.');
  }

  if (entries.length > MAX_FILE_COUNT) {
    throw new Error(
      `This archive contains too many files. The limit is ${MAX_FILE_COUNT}.`,
    );
  }

  const files: ProjectFile[] = [];
  let extractedSize = 0;

  for (const entry of entries) {
    const path = normalizePath(entry.name);

    if (!path || path.startsWith('/') || /^[a-zA-Z]:/.test(path)) {
      continue;
    }

    const parts = path.split('/');

    if (
      parts.some(
        (part) => part === '.' || part === '..' || part.length === 0,
      )
    ) {
      continue;
    }

    let bytes: Uint8Array;

    try {
      bytes = await entry.async('uint8array');
    } catch {
      throw new Error(`Could not extract "${path}" from the ZIP archive.`);
    }

    extractedSize += bytes.byteLength;

    if (extractedSize > MAX_EXTRACTED_SIZE) {
      throw new Error(
        'The extracted project exceeds the 100 MB size limit.',
      );
    }

    try {
      files.push(createProjectFile(path, bytes));
    } catch {
      // Ignore files that cannot be represented as safe project files.
    }
  }

  if (files.length === 0) {
    throw new Error('No usable project files were found in this ZIP.');
  }

  const entryHtml = findEntryHtml(files);

  if (!entryHtml) {
    throw new Error(
      'No HTML entry file was found. Include an index.html file in your ZIP.',
    );
  }

  const now = Date.now();
  const projectType = detectProjectType(files);

  return {
    id: crypto.randomUUID(),
    name: getProjectName(archive.name),
    files: Object.fromEntries(files.map((file) => [file.path, file])),
    entryHtml,
    projectType,
    runtimeStatus: 'ready',
    createdAt: now,
    updatedAt: now,
  };
}
