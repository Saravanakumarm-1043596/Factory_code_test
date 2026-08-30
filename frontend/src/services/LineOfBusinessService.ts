import type { LineOfBusiness, LineOfBusinessCreateInput, LineOfBusinessUpdateInput } from '../types/LineOfBusiness';
import { lineOfBusinessMockData } from '../mock/LineOfBusinessMock';
import { lineOfBusinessApi } from '../api/LineOfBusinessApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_lineOfBusiness';
const PRIMARY_KEY = 'line_of_business_id' as const;

function loadMock(): LineOfBusiness[] {
  if (typeof window === 'undefined') return lineOfBusinessMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LineOfBusiness[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lineOfBusinessMockData));
  return lineOfBusinessMockData;
}

function saveMock(rows: LineOfBusiness[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: LineOfBusiness[]): number {
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
  list: async (): Promise<LineOfBusiness[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<LineOfBusiness | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: LineOfBusinessCreateInput): Promise<LineOfBusiness> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as LineOfBusiness;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: LineOfBusinessUpdateInput): Promise<LineOfBusiness> => {
    const rows = loadMock();
    let updatedRecord: LineOfBusiness | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as LineOfBusiness;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('LineOfBusiness not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(lineOfBusinessMockData),
};

export const lineOfBusinessService =
  DATA_SOURCE === 'live'
    ? {
        list: lineOfBusinessApi.list,
        getById: lineOfBusinessApi.getById,
        create: lineOfBusinessApi.create,
        update: lineOfBusinessApi.update,
        remove: lineOfBusinessApi.remove,
        reset: () => undefined,
      }
    : mockService;
