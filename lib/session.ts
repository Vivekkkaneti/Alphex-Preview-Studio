
import { importZipProject } from '@/lib/importer';
import {
  deleteProject,
  getAllProjects,
  getProject,
  saveProject,
} from '@/lib/storage';

import type {
  ProjectFile,
  ProjectSession,
} from '@/lib/types';

/**
 * Import a ZIP archive and save the resulting project locally.
 */
export async function importAndSaveProject(
  archive: File,
): Promise<ProjectSession> {
  const project = await importZipProject(archive);

  await saveProject(project);

  return project;
}

/**
 * Return all saved projects, newest first.
 */
export async function listSavedProjects(): Promise<ProjectSession[]> {
  return getAllProjects();
}

/**
 * Open a previously saved project by its ID.
 */
export async function openSavedProject(
  projectId: string,
): Promise<ProjectSession> {
  const project = await getProject(projectId);

  if (!project) {
    throw new Error(
      'This project could not be found in local storage. It may have been deleted.',
    );
  }

  return project;
}

/**
 * Save changes to an existing project.
 */
export async function updateSavedProject(
  project: ProjectSession,
): Promise<ProjectSession> {
  const updatedProject: ProjectSession = {
    ...project,
    updatedAt: Date.now(),
  };

  await saveProject(updatedProject);

  return updatedProject;
}

/**
 * Update the contents of a text file in a project.
 */
export async function updateProjectFile(
  project: ProjectSession,
  filePath: string,
  content: string,
): Promise<ProjectSession> {
  const existingFile = project.files[filePath];

  if (!existingFile || existingFile.kind !== 'file') {
    throw new Error('The selected project file could not be found.');
  }

  if (typeof existingFile.content !== 'string') {
    throw new Error(
      'This file is binary and cannot be edited as text.',
    );
  }

  const updatedFile: ProjectFile = {
    ...existingFile,
    content,
    size: new TextEncoder().encode(content).byteLength,
    lastModified: Date.now(),
  };

  const updatedProject: ProjectSession = {
    ...project,
    files: {
      ...project.files,
      [filePath]: updatedFile,
    },
    updatedAt: Date.now(),
  };

  await saveProject(updatedProject);

  return updatedProject;
}

/**
 * Delete a saved project from this browser.
 */
export async function removeSavedProject(
  projectId: string,
): Promise<void> {
  await deleteProject(projectId);
}
