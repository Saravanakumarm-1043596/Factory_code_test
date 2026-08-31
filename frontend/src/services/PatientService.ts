import type { Patient, PatientCreateInput, PatientUpdateInput } from '../types/Patient';
import { patientMockData } from '../mock/PatientMock';
import { patientApi } from '../api/PatientApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_patient';
const PRIMARY_KEY = 'patient_id' as const;

function loadMock(): Patient[] {
  if (typeof window === 'undefined') return patientMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Patient[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(patientMockData));
  return patientMockData;
}

function saveMock(rows: Patient[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: Patient[]): number {
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
  if (typeof obj.no_show_risk_score === 'string' && obj.no_show_risk_score !== '') obj.no_show_risk_score = Number(obj.no_show_risk_score);
  return obj;
}

const mockService = {
  list: async (): Promise<Patient[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<Patient | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: PatientCreateInput): Promise<Patient> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as Patient;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: PatientUpdateInput): Promise<Patient> => {
    const rows = loadMock();
    let updatedRecord: Patient | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as Patient;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('Patient not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(patientMockData),

  uploadCreate: async (formData: FormData): Promise<Patient> => {
    const rows = loadMock();
    const record = { ...fromFormData(formData), [PRIMARY_KEY]: nextId(rows) } as unknown as Patient;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  uploadUpdate: async (id: string | number, formData: FormData): Promise<Patient> => {
    const rows = loadMock();
    let updatedRecord: Patient | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...fromFormData(formData) } as Patient;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('Patient not found');
    return delay(updatedRecord);
  },

  downloadUrl: (id: string | number): string => {
    const rows = loadMock();
    const row = rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id));
    return row ? String((row as unknown as Record<string, unknown>).consent_document ?? '') : '';
  },
};

export const patientService =
  DATA_SOURCE === 'live'
    ? {
        list: patientApi.list,
        getById: patientApi.getById,
        create: patientApi.create,
        update: patientApi.update,
        remove: patientApi.remove,
        reset: () => undefined,
        uploadCreate: patientApi.uploadCreate,
        uploadUpdate: patientApi.uploadUpdate,
        downloadUrl: patientApi.downloadUrl,
      }
    : mockService;
