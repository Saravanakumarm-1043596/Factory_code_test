import type { ChangeRequest, ChangeRequestCreateInput, ChangeRequestUpdateInput } from '../types/ChangeRequest';
import { changeRequestMockData } from '../mock/ChangeRequestMock';
import { changeRequestApi } from '../api/ChangeRequestApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_changeRequest';
const PRIMARY_KEY = 'change_request_id' as const;

function loadMock(): ChangeRequest[] {
  if (typeof window === 'undefined') return changeRequestMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ChangeRequest[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(changeRequestMockData));
  return changeRequestMockData;
}

function saveMock(rows: ChangeRequest[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: ChangeRequest[]): number {
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
  if (typeof obj.firewall_rule_set_id === 'string' && obj.firewall_rule_set_id !== '') obj.firewall_rule_set_id = Number(obj.firewall_rule_set_id);
  if (typeof obj.rule_issue_id === 'string' && obj.rule_issue_id !== '') obj.rule_issue_id = Number(obj.rule_issue_id);
  return obj;
}

const mockService = {
  list: async (): Promise<ChangeRequest[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<ChangeRequest | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: ChangeRequestCreateInput): Promise<ChangeRequest> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as ChangeRequest;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: ChangeRequestUpdateInput): Promise<ChangeRequest> => {
    const rows = loadMock();
    let updatedRecord: ChangeRequest | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as ChangeRequest;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ChangeRequest not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(changeRequestMockData),

  uploadCreate: async (formData: FormData): Promise<ChangeRequest> => {
    const rows = loadMock();
    const record = { ...fromFormData(formData), [PRIMARY_KEY]: nextId(rows) } as unknown as ChangeRequest;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  uploadUpdate: async (id: string | number, formData: FormData): Promise<ChangeRequest> => {
    const rows = loadMock();
    let updatedRecord: ChangeRequest | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...fromFormData(formData) } as ChangeRequest;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ChangeRequest not found');
    return delay(updatedRecord);
  },

  downloadUrl: (id: string | number): string => {
    const rows = loadMock();
    const row = rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id));
    return row ? String((row as unknown as Record<string, unknown>).attachment ?? '') : '';
  },
};

export const changeRequestService =
  DATA_SOURCE === 'live'
    ? {
        list: changeRequestApi.list,
        getById: changeRequestApi.getById,
        create: changeRequestApi.create,
        update: changeRequestApi.update,
        remove: changeRequestApi.remove,
        reset: () => undefined,
        uploadCreate: changeRequestApi.uploadCreate,
        uploadUpdate: changeRequestApi.uploadUpdate,
        downloadUrl: changeRequestApi.downloadUrl,
      }
    : mockService;
