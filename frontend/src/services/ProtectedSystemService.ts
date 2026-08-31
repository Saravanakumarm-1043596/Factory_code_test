import type { ProtectedSystem, ProtectedSystemCreateInput, ProtectedSystemUpdateInput } from '../types/ProtectedSystem';
import { protectedSystemMockData } from '../mock/ProtectedSystemMock';
import { protectedSystemApi } from '../api/ProtectedSystemApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_protectedSystem';
const PRIMARY_KEY = 'protected_system_id' as const;

function loadMock(): ProtectedSystem[] {
  if (typeof window === 'undefined') return protectedSystemMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProtectedSystem[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(protectedSystemMockData));
  return protectedSystemMockData;
}

function saveMock(rows: ProtectedSystem[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: ProtectedSystem[]): number {
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
  list: async (): Promise<ProtectedSystem[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<ProtectedSystem | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: ProtectedSystemCreateInput): Promise<ProtectedSystem> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as ProtectedSystem;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: ProtectedSystemUpdateInput): Promise<ProtectedSystem> => {
    const rows = loadMock();
    let updatedRecord: ProtectedSystem | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as ProtectedSystem;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ProtectedSystem not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(protectedSystemMockData),
};

export const protectedSystemService =
  DATA_SOURCE === 'live'
    ? {
        list: protectedSystemApi.list,
        getById: protectedSystemApi.getById,
        create: protectedSystemApi.create,
        update: protectedSystemApi.update,
        remove: protectedSystemApi.remove,
        reset: () => undefined,
      }
    : mockService;
