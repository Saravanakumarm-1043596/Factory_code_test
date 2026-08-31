import type { PatientEngagement, PatientEngagementCreateInput, PatientEngagementUpdateInput } from '../types/PatientEngagement';
import { patientEngagementMockData } from '../mock/PatientEngagementMock';
import { patientEngagementApi } from '../api/PatientEngagementApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_patientEngagement';
const PRIMARY_KEY = 'patient_engagement_id' as const;

function loadMock(): PatientEngagement[] {
  if (typeof window === 'undefined') return patientEngagementMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PatientEngagement[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(patientEngagementMockData));
  return patientEngagementMockData;
}

function saveMock(rows: PatientEngagement[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: PatientEngagement[]): number {
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
  list: async (): Promise<PatientEngagement[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<PatientEngagement | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: PatientEngagementCreateInput): Promise<PatientEngagement> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as PatientEngagement;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: PatientEngagementUpdateInput): Promise<PatientEngagement> => {
    const rows = loadMock();
    let updatedRecord: PatientEngagement | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as PatientEngagement;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('PatientEngagement not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(patientEngagementMockData),
};

export const patientEngagementService =
  DATA_SOURCE === 'live'
    ? {
        list: patientEngagementApi.list,
        getById: patientEngagementApi.getById,
        create: patientEngagementApi.create,
        update: patientEngagementApi.update,
        remove: patientEngagementApi.remove,
        reset: () => undefined,
      }
    : mockService;
