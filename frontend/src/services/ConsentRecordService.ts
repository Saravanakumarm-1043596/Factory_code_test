import type { ConsentRecord, ConsentRecordCreateInput, ConsentRecordUpdateInput } from '../types/ConsentRecord';
import { consentRecordMockData } from '../mock/ConsentRecordMock';
import { consentRecordApi } from '../api/ConsentRecordApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_consentRecord';
const PRIMARY_KEY = 'consent_record_id' as const;

function loadMock(): ConsentRecord[] {
  if (typeof window === 'undefined') return consentRecordMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ConsentRecord[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consentRecordMockData));
  return consentRecordMockData;
}

function saveMock(rows: ConsentRecord[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: ConsentRecord[]): number {
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

  return obj;
}

const mockService = {
  list: async (): Promise<ConsentRecord[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<ConsentRecord | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: ConsentRecordCreateInput): Promise<ConsentRecord> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as ConsentRecord;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: ConsentRecordUpdateInput): Promise<ConsentRecord> => {
    const rows = loadMock();
    let updatedRecord: ConsentRecord | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as ConsentRecord;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ConsentRecord not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(consentRecordMockData),

  uploadCreate: async (formData: FormData): Promise<ConsentRecord> => {
    const rows = loadMock();
    const record = { ...fromFormData(formData), [PRIMARY_KEY]: nextId(rows) } as unknown as ConsentRecord;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  uploadUpdate: async (id: string | number, formData: FormData): Promise<ConsentRecord> => {
    const rows = loadMock();
    let updatedRecord: ConsentRecord | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...fromFormData(formData) } as ConsentRecord;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ConsentRecord not found');
    return delay(updatedRecord);
  },

  downloadUrl: (id: string | number): string => {
    const rows = loadMock();
    const row = rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id));
    return row ? String((row as unknown as Record<string, unknown>).consent_document ?? '') : '';
  },
};

export const consentRecordService =
  DATA_SOURCE === 'live'
    ? {
        list: consentRecordApi.list,
        getById: consentRecordApi.getById,
        create: consentRecordApi.create,
        update: consentRecordApi.update,
        remove: consentRecordApi.remove,
        reset: () => undefined,
        uploadCreate: consentRecordApi.uploadCreate,
        uploadUpdate: consentRecordApi.uploadUpdate,
        downloadUrl: consentRecordApi.downloadUrl,
      }
    : mockService;
