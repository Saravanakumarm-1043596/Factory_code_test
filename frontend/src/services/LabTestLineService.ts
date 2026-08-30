import type { LabTestLine, LabTestLineCreateInput, LabTestLineUpdateInput } from '../types/LabTestLine';
import { labTestLineMockData } from '../mock/LabTestLineMock';
import { labTestLineApi } from '../api/LabTestLineApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_labTestLine';
const PRIMARY_KEY = 'lab_test_line_id' as const;

function loadMock(): LabTestLine[] {
  if (typeof window === 'undefined') return labTestLineMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LabTestLine[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(labTestLineMockData));
  return labTestLineMockData;
}

function saveMock(rows: LabTestLine[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: LabTestLine[]): number {
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
  list: async (): Promise<LabTestLine[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<LabTestLine | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: LabTestLineCreateInput): Promise<LabTestLine> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as LabTestLine;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: LabTestLineUpdateInput): Promise<LabTestLine> => {
    const rows = loadMock();
    let updatedRecord: LabTestLine | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as LabTestLine;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('LabTestLine not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(labTestLineMockData),
};

export const labTestLineService =
  DATA_SOURCE === 'live'
    ? {
        list: labTestLineApi.list,
        getById: labTestLineApi.getById,
        create: labTestLineApi.create,
        update: labTestLineApi.update,
        remove: labTestLineApi.remove,
        reset: () => undefined,
      }
    : mockService;
