import type { ClaimLine, ClaimLineCreateInput, ClaimLineUpdateInput } from '../types/ClaimLine';
import { claimLineMockData } from '../mock/ClaimLineMock';
import { claimLineApi } from '../api/ClaimLineApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_claimLine';
const PRIMARY_KEY = 'claim_line_id' as const;

function loadMock(): ClaimLine[] {
  if (typeof window === 'undefined') return claimLineMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ClaimLine[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(claimLineMockData));
  return claimLineMockData;
}

function saveMock(rows: ClaimLine[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: ClaimLine[]): number {
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
  list: async (): Promise<ClaimLine[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<ClaimLine | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: ClaimLineCreateInput): Promise<ClaimLine> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as ClaimLine;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: ClaimLineUpdateInput): Promise<ClaimLine> => {
    const rows = loadMock();
    let updatedRecord: ClaimLine | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as ClaimLine;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ClaimLine not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(claimLineMockData),
};

export const claimLineService =
  DATA_SOURCE === 'live'
    ? {
        list: claimLineApi.list,
        getById: claimLineApi.getById,
        create: claimLineApi.create,
        update: claimLineApi.update,
        remove: claimLineApi.remove,
        reset: () => undefined,
      }
    : mockService;
