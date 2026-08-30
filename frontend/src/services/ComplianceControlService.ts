import type { ComplianceControl, ComplianceControlCreateInput, ComplianceControlUpdateInput } from '../types/ComplianceControl';
import { complianceControlMockData } from '../mock/ComplianceControlMock';
import { complianceControlApi } from '../api/ComplianceControlApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_complianceControl';
const PRIMARY_KEY = 'compliance_control_id' as const;

function loadMock(): ComplianceControl[] {
  if (typeof window === 'undefined') return complianceControlMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ComplianceControl[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(complianceControlMockData));
  return complianceControlMockData;
}

function saveMock(rows: ComplianceControl[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: ComplianceControl[]): number {
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
  list: async (): Promise<ComplianceControl[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<ComplianceControl | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: ComplianceControlCreateInput): Promise<ComplianceControl> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as ComplianceControl;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: ComplianceControlUpdateInput): Promise<ComplianceControl> => {
    const rows = loadMock();
    let updatedRecord: ComplianceControl | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as ComplianceControl;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ComplianceControl not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(complianceControlMockData),

  uploadCreate: async (formData: FormData): Promise<ComplianceControl> => {
    const rows = loadMock();
    const record = { ...fromFormData(formData), [PRIMARY_KEY]: nextId(rows) } as unknown as ComplianceControl;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  uploadUpdate: async (id: string | number, formData: FormData): Promise<ComplianceControl> => {
    const rows = loadMock();
    let updatedRecord: ComplianceControl | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...fromFormData(formData) } as ComplianceControl;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ComplianceControl not found');
    return delay(updatedRecord);
  },

  downloadUrl: (id: string | number): string => {
    const rows = loadMock();
    const row = rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id));
    return row ? String((row as unknown as Record<string, unknown>).evidence_document ?? '') : '';
  },
};

export const complianceControlService =
  DATA_SOURCE === 'live'
    ? {
        list: complianceControlApi.list,
        getById: complianceControlApi.getById,
        create: complianceControlApi.create,
        update: complianceControlApi.update,
        remove: complianceControlApi.remove,
        reset: () => undefined,
        uploadCreate: complianceControlApi.uploadCreate,
        uploadUpdate: complianceControlApi.uploadUpdate,
        downloadUrl: complianceControlApi.downloadUrl,
      }
    : mockService;
