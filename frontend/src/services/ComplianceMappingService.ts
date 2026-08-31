import type { ComplianceMapping, ComplianceMappingCreateInput, ComplianceMappingUpdateInput } from '../types/ComplianceMapping';
import { complianceMappingMockData } from '../mock/ComplianceMappingMock';
import { complianceMappingApi } from '../api/ComplianceMappingApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_complianceMapping';
const PRIMARY_KEY = 'compliance_mapping_id' as const;

function loadMock(): ComplianceMapping[] {
  if (typeof window === 'undefined') return complianceMappingMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ComplianceMapping[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(complianceMappingMockData));
  return complianceMappingMockData;
}

function saveMock(rows: ComplianceMapping[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: ComplianceMapping[]): number {
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
  if (typeof obj.protected_system_id === 'string' && obj.protected_system_id !== '') obj.protected_system_id = Number(obj.protected_system_id);
  if (typeof obj.firewall_rule_set_id === 'string' && obj.firewall_rule_set_id !== '') obj.firewall_rule_set_id = Number(obj.firewall_rule_set_id);
  return obj;
}

const mockService = {
  list: async (): Promise<ComplianceMapping[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<ComplianceMapping | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: ComplianceMappingCreateInput): Promise<ComplianceMapping> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as ComplianceMapping;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: ComplianceMappingUpdateInput): Promise<ComplianceMapping> => {
    const rows = loadMock();
    let updatedRecord: ComplianceMapping | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as ComplianceMapping;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ComplianceMapping not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(complianceMappingMockData),

  uploadCreate: async (formData: FormData): Promise<ComplianceMapping> => {
    const rows = loadMock();
    const record = { ...fromFormData(formData), [PRIMARY_KEY]: nextId(rows) } as unknown as ComplianceMapping;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  uploadUpdate: async (id: string | number, formData: FormData): Promise<ComplianceMapping> => {
    const rows = loadMock();
    let updatedRecord: ComplianceMapping | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...fromFormData(formData) } as ComplianceMapping;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ComplianceMapping not found');
    return delay(updatedRecord);
  },

  downloadUrl: (id: string | number): string => {
    const rows = loadMock();
    const row = rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id));
    return row ? String((row as unknown as Record<string, unknown>).evidence_file ?? '') : '';
  },
};

export const complianceMappingService =
  DATA_SOURCE === 'live'
    ? {
        list: complianceMappingApi.list,
        getById: complianceMappingApi.getById,
        create: complianceMappingApi.create,
        update: complianceMappingApi.update,
        remove: complianceMappingApi.remove,
        reset: () => undefined,
        uploadCreate: complianceMappingApi.uploadCreate,
        uploadUpdate: complianceMappingApi.uploadUpdate,
        downloadUrl: complianceMappingApi.downloadUrl,
      }
    : mockService;
