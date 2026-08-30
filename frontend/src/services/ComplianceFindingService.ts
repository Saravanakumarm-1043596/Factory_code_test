import type { ComplianceFinding, ComplianceFindingCreateInput, ComplianceFindingUpdateInput } from '../types/ComplianceFinding';
import { complianceFindingMockData } from '../mock/ComplianceFindingMock';
import { complianceFindingApi } from '../api/ComplianceFindingApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_complianceFinding';
const PRIMARY_KEY = 'compliance_finding_id' as const;

function loadMock(): ComplianceFinding[] {
  if (typeof window === 'undefined') return complianceFindingMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ComplianceFinding[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(complianceFindingMockData));
  return complianceFindingMockData;
}

function saveMock(rows: ComplianceFinding[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: ComplianceFinding[]): number {
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
  if (typeof obj.compliance_control_id === 'string' && obj.compliance_control_id !== '') obj.compliance_control_id = Number(obj.compliance_control_id);
  if (typeof obj.affected_line_of_business_id === 'string' && obj.affected_line_of_business_id !== '') obj.affected_line_of_business_id = Number(obj.affected_line_of_business_id);
  return obj;
}

const mockService = {
  list: async (): Promise<ComplianceFinding[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<ComplianceFinding | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: ComplianceFindingCreateInput): Promise<ComplianceFinding> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as ComplianceFinding;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: ComplianceFindingUpdateInput): Promise<ComplianceFinding> => {
    const rows = loadMock();
    let updatedRecord: ComplianceFinding | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as ComplianceFinding;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ComplianceFinding not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(complianceFindingMockData),

  uploadCreate: async (formData: FormData): Promise<ComplianceFinding> => {
    const rows = loadMock();
    const record = { ...fromFormData(formData), [PRIMARY_KEY]: nextId(rows) } as unknown as ComplianceFinding;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  uploadUpdate: async (id: string | number, formData: FormData): Promise<ComplianceFinding> => {
    const rows = loadMock();
    let updatedRecord: ComplianceFinding | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...fromFormData(formData) } as ComplianceFinding;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ComplianceFinding not found');
    return delay(updatedRecord);
  },

  downloadUrl: (id: string | number): string => {
    const rows = loadMock();
    const row = rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id));
    return row ? String((row as unknown as Record<string, unknown>).evidence_attachment ?? '') : '';
  },
};

export const complianceFindingService =
  DATA_SOURCE === 'live'
    ? {
        list: complianceFindingApi.list,
        getById: complianceFindingApi.getById,
        create: complianceFindingApi.create,
        update: complianceFindingApi.update,
        remove: complianceFindingApi.remove,
        reset: () => undefined,
        uploadCreate: complianceFindingApi.uploadCreate,
        uploadUpdate: complianceFindingApi.uploadUpdate,
        downloadUrl: complianceFindingApi.downloadUrl,
      }
    : mockService;
