import type { Appliance, ApplianceCreateInput, ApplianceUpdateInput } from '../types/Appliance';
import { applianceMockData } from '../mock/ApplianceMock';
import { applianceApi } from '../api/ApplianceApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_appliance';
const PRIMARY_KEY = 'appliance_id' as const;

function loadMock(): Appliance[] {
  if (typeof window === 'undefined') return applianceMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Appliance[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applianceMockData));
  return applianceMockData;
}

function saveMock(rows: Appliance[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: Appliance[]): number {
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
  list: async (): Promise<Appliance[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<Appliance | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: ApplianceCreateInput): Promise<Appliance> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as Appliance;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: ApplianceUpdateInput): Promise<Appliance> => {
    const rows = loadMock();
    let updatedRecord: Appliance | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as Appliance;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('Appliance not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(applianceMockData),
};

export const applianceService =
  DATA_SOURCE === 'live'
    ? {
        list: applianceApi.list,
        getById: applianceApi.getById,
        create: applianceApi.create,
        update: applianceApi.update,
        remove: applianceApi.remove,
        reset: () => undefined,
      }
    : mockService;
