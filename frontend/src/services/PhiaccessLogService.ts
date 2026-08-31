import type { PhiaccessLog, PhiaccessLogCreateInput, PhiaccessLogUpdateInput } from '../types/PhiaccessLog';
import { phiaccessLogMockData } from '../mock/PhiaccessLogMock';
import { phiaccessLogApi } from '../api/PhiaccessLogApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_phiaccessLog';
const PRIMARY_KEY = 'phi_access_log_id' as const;

function loadMock(): PhiaccessLog[] {
  if (typeof window === 'undefined') return phiaccessLogMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PhiaccessLog[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(phiaccessLogMockData));
  return phiaccessLogMockData;
}

function saveMock(rows: PhiaccessLog[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: PhiaccessLog[]): number {
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
  list: async (): Promise<PhiaccessLog[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<PhiaccessLog | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: PhiaccessLogCreateInput): Promise<PhiaccessLog> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as PhiaccessLog;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: PhiaccessLogUpdateInput): Promise<PhiaccessLog> => {
    const rows = loadMock();
    let updatedRecord: PhiaccessLog | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as PhiaccessLog;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('PhiaccessLog not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(phiaccessLogMockData),
};

export const phiaccessLogService =
  DATA_SOURCE === 'live'
    ? {
        list: phiaccessLogApi.list,
        getById: phiaccessLogApi.getById,
        create: phiaccessLogApi.create,
        update: phiaccessLogApi.update,
        remove: phiaccessLogApi.remove,
        reset: () => undefined,
      }
    : mockService;
