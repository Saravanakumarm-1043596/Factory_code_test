import type { BreachIncident, BreachIncidentCreateInput, BreachIncidentUpdateInput } from '../types/BreachIncident';
import { breachIncidentMockData } from '../mock/BreachIncidentMock';
import { breachIncidentApi } from '../api/BreachIncidentApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_breachIncident';
const PRIMARY_KEY = 'breach_incident_id' as const;

function loadMock(): BreachIncident[] {
  if (typeof window === 'undefined') return breachIncidentMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BreachIncident[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(breachIncidentMockData));
  return breachIncidentMockData;
}

function saveMock(rows: BreachIncident[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: BreachIncident[]): number {
  const numericIds = rows
    .map((r) => (r as unknown as Record<string, unknown>)[PRIMARY_KEY])
    .filter((v): v is number => typeof v === 'number');
  return (numericIds.length ? Math.max(...numericIds) : 0) + 1;
}

async function delay<T>(value: T): Promise<T> {
  // Tiny artificial latency so loading states are visible even in mock mode.
  return new Promise((resolve) => setTimeout(() => resolve(value), 180));
}

function fromFormData(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  if (typeof obj.affected_patient_count === 'string' && obj.affected_patient_count !== '') obj.affected_patient_count = Number(obj.affected_patient_count);
  return obj;
}

const mockService = {
  list: async (): Promise<BreachIncident[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<BreachIncident | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: BreachIncidentCreateInput): Promise<BreachIncident> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as BreachIncident;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: BreachIncidentUpdateInput): Promise<BreachIncident> => {
    const rows = loadMock();
    let updatedRecord: BreachIncident | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as BreachIncident;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('BreachIncident not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(breachIncidentMockData),

  uploadCreate: async (formData: FormData): Promise<BreachIncident> => {
    const rows = loadMock();
    const record = { ...fromFormData(formData), [PRIMARY_KEY]: nextId(rows) } as unknown as BreachIncident;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  uploadUpdate: async (id: string | number, formData: FormData): Promise<BreachIncident> => {
    const rows = loadMock();
    let updatedRecord: BreachIncident | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...fromFormData(formData) } as BreachIncident;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('BreachIncident not found');
    return delay(updatedRecord);
  },

  downloadUrl: (id: string | number): string => {
    const rows = loadMock();
    const row = rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id));
    return row ? String((row as unknown as Record<string, unknown>).supporting_document ?? '') : '';
  },
};

export const breachIncidentService =
  DATA_SOURCE === 'live'
    ? {
        list: breachIncidentApi.list,
        getById: breachIncidentApi.getById,
        create: breachIncidentApi.create,
        update: breachIncidentApi.update,
        remove: breachIncidentApi.remove,
        reset: () => undefined,
        uploadCreate: breachIncidentApi.uploadCreate,
        uploadUpdate: breachIncidentApi.uploadUpdate,
        downloadUrl: breachIncidentApi.downloadUrl,
      }
    : mockService;
