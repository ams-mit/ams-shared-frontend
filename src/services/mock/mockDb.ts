import { store } from '@/app/store';
import { ServiceError } from '@/services/api/standardClient';
import { mockLatency } from './mockMode';

// A tiny localStorage-backed "database" for the demo build. Each collection is seeded once and
// then everything created or changed in the app is saved in the browser, so it survives
// reloads. Bump DB_VERSION when seed shapes change so old browser data is replaced.

const DB_VERSION = 'v1';
const keyFor = (name: string) => `ams_${DB_VERSION}_${name}`;

const read = <T,>(name: string, seed: () => T[]): T[] => {
  try {
    const raw = localStorage.getItem(keyFor(name));
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    // Unreadable data: start again from the seed.
  }
  const initial = seed();
  write(name, initial);
  return initial;
};

const write = <T,>(name: string, rows: T[]): void => {
  try {
    localStorage.setItem(keyFor(name), JSON.stringify(rows));
  } catch {
    // Storage full or blocked: keep working for this page view.
  }
};

export interface MockCollection<T extends { id: string | number }> {
  all: () => T[];
  find: (id: T['id']) => T | undefined;
  /** Throws a 404 ServiceError with `code` when the row doesn't exist. */
  require: (id: T['id'], code: string, message: string) => T;
  insert: (row: T) => T;
  update: (id: T['id'], patch: Partial<T>) => T;
  remove: (id: T['id']) => void;
}

export const createCollection = <T extends { id: string | number }>(name: string, seed: () => T[]): MockCollection<T> => {
  const all = () => read<T>(name, seed);
  const collection: MockCollection<T> = {
    all,
    find: (id) => all().find((row) => row.id === id),
    require: (id, code, message) => {
      const row = collection.find(id);
      if (!row) throw new ServiceError(404, message, code);
      return row;
    },
    insert: (row) => {
      write(name, [row, ...all()]);
      return row;
    },
    update: (id, patch) => {
      let updated: T | undefined;
      write(
        name,
        all().map((row) => {
          if (row.id !== id) return row;
          updated = { ...row, ...patch };
          return updated;
        })
      );
      if (!updated) throw new ServiceError(404, 'The record could not be found.', 'NOT_FOUND');
      return updated;
    },
    remove: (id) => write(name, all().filter((row) => row.id !== id)),
  };
  return collection;
};

export const uuid = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

/** Numeric ids for features whose types use numbers. */
export const numericId = (): number => Date.now() + Math.floor(Math.random() * 1000);

export const nowIso = (): string => new Date().toISOString();
export const today = (): string => new Date().toISOString().slice(0, 10);

/** Waits the simulated latency, then runs the handler (errors included). */
export const respond = async <T,>(handler: () => T): Promise<T> => {
  await mockLatency();
  return handler();
};

/** The signed-in demo user (honours the persona switcher). */
export const mockActor = () => {
  const { user, currentUser, activeRole } = store.getState().auth;
  const actor = user ?? currentUser;
  return { id: actor.id, name: actor.name, role: activeRole };
};

export const isManager = () => {
  const { role } = mockActor();
  return role === 'ADMIN' || role === 'STAFF';
};

export const fail = (status: number, code: string, message: string, fieldErrors?: Record<string, string>): never => {
  throw new ServiceError(status, message, code, fieldErrors);
};

/** Pages a list the way the services do (0-based page). */
export const paginate = <T,>(rows: T[], page = 0, size = 20) => {
  const totalElements = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  return {
    items: rows.slice(page * size, page * size + size),
    pagination: { page, size, totalElements, totalPages, hasNext: page + 1 < totalPages, hasPrevious: page > 0 },
  };
};
