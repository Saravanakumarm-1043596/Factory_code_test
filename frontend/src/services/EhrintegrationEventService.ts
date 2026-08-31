import type { EhrintegrationEvent, EhrintegrationEventCreateInput, EhrintegrationEventUpdateInput } from '../types/EhrintegrationEvent';
import { ehrintegrationEventMockData } from '../mock/EhrintegrationEventMock';
import { ehrintegrationEventApi } from '../api/EhrintegrationEventApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_ehrintegrationEvent';
const PRIMARY_KEY = 'ehr_integration_event_id' as const;

function loadMock(): EhrintegrationEvent[] {
  if (typeof window === 'undefined') return ehrintegrationEventMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as EhrintegrationEvent[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ehrintegrationEventMockData));
  return ehrintegrationEventMockData;
}

function saveMock(rows: EhrintegrationEvent[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: EhrintegrationEvent[]): number {
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
  if (typeof obj.retry_count === 'string' && obj.retry_count !== '') obj.retry_count = Number(obj.retry_count);
  return obj;
}

const mockService = {
  list: async (): Promise<EhrintegrationEvent[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<EhrintegrationEvent | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: EhrintegrationEventCreateInput): Promise<EhrintegrationEvent> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as EhrintegrationEvent;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: EhrintegrationEventUpdateInput): Promise<EhrintegrationEvent> => {
    const rows = loadMock();
    let updatedRecord: EhrintegrationEvent | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as EhrintegrationEvent;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('EhrintegrationEvent not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(ehrintegrationEventMockData),

  uploadCreate: async (formData: FormData): Promise<EhrintegrationEvent> => {
    const rows = loadMock();
    const record = { ...fromFormData(formData), [PRIMARY_KEY]: nextId(rows) } as unknown as EhrintegrationEvent;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  uploadUpdate: async (id: string | number, formData: FormData): Promise<EhrintegrationEvent> => {
    const rows = loadMock();
    let updatedRecord: EhrintegrationEvent | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...fromFormData(formData) } as EhrintegrationEvent;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('EhrintegrationEvent not found');
    return delay(updatedRecord);
  },

  downloadUrl: (id: string | number): string => {
    const rows = loadMock();
    const row = rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id));
    return row ? String((row as unknown as Record<string, unknown>).payload_file ?? '') : '';
  },
};

export const ehrintegrationEventService =
  DATA_SOURCE === 'live'
    ? {
        list: ehrintegrationEventApi.list,
        getById: ehrintegrationEventApi.getById,
        create: ehrintegrationEventApi.create,
        update: ehrintegrationEventApi.update,
        remove: ehrintegrationEventApi.remove,
        reset: () => undefined,
        uploadCreate: ehrintegrationEventApi.uploadCreate,
        uploadUpdate: ehrintegrationEventApi.uploadUpdate,
        downloadUrl: ehrintegrationEventApi.downloadUrl,
      }
    : mockService;
