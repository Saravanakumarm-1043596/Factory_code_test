import type { ClaimError, ClaimErrorCreateInput, ClaimErrorUpdateInput } from '../types/ClaimError';
import { claimErrorMockData } from '../mock/ClaimErrorMock';
import { claimErrorApi } from '../api/ClaimErrorApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_claimError';
const PRIMARY_KEY = 'claim_error_id' as const;

function loadMock(): ClaimError[] {
  if (typeof window === 'undefined') return claimErrorMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ClaimError[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(claimErrorMockData));
  return claimErrorMockData;
}

function saveMock(rows: ClaimError[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: ClaimError[]): number {
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
  list: async (): Promise<ClaimError[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<ClaimError | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: ClaimErrorCreateInput): Promise<ClaimError> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as ClaimError;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: ClaimErrorUpdateInput): Promise<ClaimError> => {
    const rows = loadMock();
    let updatedRecord: ClaimError | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as ClaimError;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ClaimError not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(claimErrorMockData),
};

export const claimErrorService =
  DATA_SOURCE === 'live'
    ? {
        list: claimErrorApi.list,
        getById: claimErrorApi.getById,
        create: claimErrorApi.create,
        update: claimErrorApi.update,
        remove: claimErrorApi.remove,
        reset: () => undefined,
      }
    : mockService;
