import type { PhiAccessLog, PhiAccessLogCreateInput, PhiAccessLogUpdateInput } from '../types/PhiAccessLog';
import { phiAccessLogMockData } from '../mock/PhiAccessLogMock';
import { phiAccessLogApi } from '../api/PhiAccessLogApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_phiAccessLog';
const PRIMARY_KEY = 'phi_access_log_id' as const;

function loadMock(): PhiAccessLog[] {
  if (typeof window === 'undefined') return phiAccessLogMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PhiAccessLog[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(phiAccessLogMockData));
  return phiAccessLogMockData;
}

function saveMock(rows: PhiAccessLog[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: PhiAccessLog[]): number {
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
  list: async (): Promise<PhiAccessLog[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<PhiAccessLog | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: PhiAccessLogCreateInput): Promise<PhiAccessLog> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as PhiAccessLog;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: PhiAccessLogUpdateInput): Promise<PhiAccessLog> => {
    const rows = loadMock();
    let updatedRecord: PhiAccessLog | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as PhiAccessLog;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('PhiAccessLog not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(phiAccessLogMockData),
};

export const phiAccessLogService =
  DATA_SOURCE === 'live'
    ? {
        list: phiAccessLogApi.list,
        getById: phiAccessLogApi.getById,
        create: phiAccessLogApi.create,
        update: phiAccessLogApi.update,
        remove: phiAccessLogApi.remove,
        reset: () => undefined,
      }
    : mockService;
