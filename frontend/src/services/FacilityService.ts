import type { Facility, FacilityCreateInput, FacilityUpdateInput } from '../types/Facility';
import { facilityMockData } from '../mock/FacilityMock';
import { facilityApi } from '../api/FacilityApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_facility';
const PRIMARY_KEY = 'facility_id' as const;

function loadMock(): Facility[] {
  if (typeof window === 'undefined') return facilityMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Facility[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(facilityMockData));
  return facilityMockData;
}

function saveMock(rows: Facility[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: Facility[]): number {
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
  list: async (): Promise<Facility[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<Facility | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: FacilityCreateInput): Promise<Facility> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as Facility;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: FacilityUpdateInput): Promise<Facility> => {
    const rows = loadMock();
    let updatedRecord: Facility | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as Facility;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('Facility not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(facilityMockData),
};

export const facilityService =
  DATA_SOURCE === 'live'
    ? {
        list: facilityApi.list,
        getById: facilityApi.getById,
        create: facilityApi.create,
        update: facilityApi.update,
        remove: facilityApi.remove,
        reset: () => undefined,
      }
    : mockService;
