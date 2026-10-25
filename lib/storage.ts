
import type { ProjectSession } from '@/lib/types';

const DATABASE_NAME = 'alphex-preview-studio';
const DATABASE_VERSION = 1;
const STORE_NAME = 'projects';

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.reject(
      new Error('Your browser does not support local project storage.'),
    );
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(
      DATABASE_NAME,
      DATABASE_VERSION,
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });

        store.createIndex('updatedAt', 'updatedAt', {
          unique: false,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => {
      reject(request.error ?? new Error('Could not open project storage.'));
    };

    request.onblocked = () => {
      reject(new Error('Project storage is blocked by another browser tab.'));
    };
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);

    request.onerror = () => {
      reject(request.error ?? new Error('The storage request failed.'));
    };
  });
}

export async function getAllProjects(): Promise<ProjectSession[]> {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll();

    const projects = await requestResult<ProjectSession[]>(request);

    return projects.sort((a, b) => b.updatedAt - a.updatedAt);
  } finally {
    database.close();
  }
}

export async function getProject(
  id: string,
): Promise<ProjectSession | null> {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(id);

    const project = await requestResult<ProjectSession | undefined>(
      request,
    );

    return project ?? null;
  } finally {
    database.close();
  }
}

export async function saveProject(
  project: ProjectSession,
): Promise<void> {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');

    const completion = new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();

      transaction.onerror = () => {
        reject(
          transaction.error ?? new Error('Could not save the project.'),
        );
      };

      transaction.onabort = () => {
        reject(
          transaction.error ?? new Error('Project saving was cancelled.'),
        );
      };
    });

    transaction.objectStore(STORE_NAME).put({
      ...project,
      updatedAt: Date.now(),
    });

    await completion;
  } finally {
    database.close();
  }
}

export async function deleteProject(id: string): Promise<void> {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');

    const completion = new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();

      transaction.onerror = () => {
        reject(
          transaction.error ?? new Error('Could not delete the project.'),
        );
      };

      transaction.onabort = () => {
        reject(
          transaction.error ?? new Error('Project deletion was cancelled.'),
        );
      };
    });

    transaction.objectStore(STORE_NAME).delete(id);

    await completion;
  } finally {
    database.close();
  }
}

export async function clearProjects(): Promise<void> {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');

    const completion = new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();

      transaction.onerror = () => {
        reject(
          transaction.error ?? new Error('Could not clear project storage.'),
        );
      };

      transaction.onabort = () => {
        reject(
          transaction.error ?? new Error('Clearing project storage was cancelled.'),
        );
      };
    });

    transaction.objectStore(STORE_NAME).clear();

    await completion;
  } finally {
    database.close();
  }
}
