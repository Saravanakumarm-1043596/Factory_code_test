import type { AppUser, AppUserCreateInput, AppUserUpdateInput } from '../types/AppUser';
import { appUserMockData } from '../mock/AppUserMock';
import { appUserApi } from '../api/AppUserApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_appUser';
const PRIMARY_KEY = 'app_user_id' as const;

function loadMock(): AppUser[] {
  if (typeof window === 'undefined') return appUserMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppUser[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appUserMockData));
  return appUserMockData;
}

function saveMock(rows: AppUser[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: AppUser[]): number {
  const numericIds = rows
    .map((r) => (r as unknown as Record<string, unknown>)[PRIMARY_KEY])
    .filter((v): v is number => typeof v === 'number');
  return (numericIds.length ? Math.max(...numericIds) : 0) + 1;
}

async function delay<T>(value: T): Promise<T> {
  // Tiny artificial latency so loading states are visible even in mock mode.
  return new Promise((resolve) => setTimeout(() => resolve(value), 180));
}

const mockService = {
  list: async (): Promise<AppUser[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<AppUser | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: AppUserCreateInput): Promise<AppUser> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as AppUser;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: AppUserUpdateInput): Promise<AppUser> => {
    const rows = loadMock();
    let updatedRecord: AppUser | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as AppUser;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('AppUser not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(appUserMockData),
};

export const appUserService =
  DATA_SOURCE === 'live'
    ? {
        list: appUserApi.list,
        getById: appUserApi.getById,
        create: appUserApi.create,
        update: appUserApi.update,
        remove: appUserApi.remove,
        reset: () => undefined,
      }
    : mockService;
