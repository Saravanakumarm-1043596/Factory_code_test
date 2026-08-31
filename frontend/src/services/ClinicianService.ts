import type { Clinician, ClinicianCreateInput, ClinicianUpdateInput } from '../types/Clinician';
import { clinicianMockData } from '../mock/ClinicianMock';
import { clinicianApi } from '../api/ClinicianApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_clinician';
const PRIMARY_KEY = 'clinician_id' as const;

function loadMock(): Clinician[] {
  if (typeof window === 'undefined') return clinicianMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Clinician[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clinicianMockData));
  return clinicianMockData;
}

function saveMock(rows: Clinician[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: Clinician[]): number {
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
  list: async (): Promise<Clinician[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<Clinician | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: ClinicianCreateInput): Promise<Clinician> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as Clinician;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: ClinicianUpdateInput): Promise<Clinician> => {
    const rows = loadMock();
    let updatedRecord: Clinician | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as Clinician;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('Clinician not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(clinicianMockData),
};

export const clinicianService =
  DATA_SOURCE === 'live'
    ? {
        list: clinicianApi.list,
        getById: clinicianApi.getById,
        create: clinicianApi.create,
        update: clinicianApi.update,
        remove: clinicianApi.remove,
        reset: () => undefined,
      }
    : mockService;
