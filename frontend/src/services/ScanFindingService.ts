import type { ScanFinding, ScanFindingCreateInput, ScanFindingUpdateInput } from '../types/ScanFinding';
import { scanFindingMockData } from '../mock/ScanFindingMock';
import { scanFindingApi } from '../api/ScanFindingApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_scanFinding';
const PRIMARY_KEY = 'scan_finding_id' as const;

function loadMock(): ScanFinding[] {
  if (typeof window === 'undefined') return scanFindingMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ScanFinding[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scanFindingMockData));
  return scanFindingMockData;
}

function saveMock(rows: ScanFinding[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: ScanFinding[]): number {
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
  list: async (): Promise<ScanFinding[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<ScanFinding | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: ScanFindingCreateInput): Promise<ScanFinding> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as ScanFinding;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: ScanFindingUpdateInput): Promise<ScanFinding> => {
    const rows = loadMock();
    let updatedRecord: ScanFinding | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as ScanFinding;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ScanFinding not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(scanFindingMockData),
};

export const scanFindingService =
  DATA_SOURCE === 'live'
    ? {
        list: scanFindingApi.list,
        getById: scanFindingApi.getById,
        create: scanFindingApi.create,
        update: scanFindingApi.update,
        remove: scanFindingApi.remove,
        reset: () => undefined,
      }
    : mockService;
