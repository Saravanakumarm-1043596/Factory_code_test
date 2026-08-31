import type { AuditScan, AuditScanCreateInput, AuditScanUpdateInput } from '../types/AuditScan';
import { auditScanMockData } from '../mock/AuditScanMock';
import { auditScanApi } from '../api/AuditScanApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_auditScan';
const PRIMARY_KEY = 'audit_scan_id' as const;

function loadMock(): AuditScan[] {
  if (typeof window === 'undefined') return auditScanMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuditScan[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auditScanMockData));
  return auditScanMockData;
}

function saveMock(rows: AuditScan[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: AuditScan[]): number {
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
  if (typeof obj.total_rules_analyzed === 'string' && obj.total_rules_analyzed !== '') obj.total_rules_analyzed = Number(obj.total_rules_analyzed);
  if (typeof obj.issues_found === 'string' && obj.issues_found !== '') obj.issues_found = Number(obj.issues_found);
  if (typeof obj.critical_issues_found === 'string' && obj.critical_issues_found !== '') obj.critical_issues_found = Number(obj.critical_issues_found);
  return obj;
}

const mockService = {
  list: async (): Promise<AuditScan[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<AuditScan | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: AuditScanCreateInput): Promise<AuditScan> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as AuditScan;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: AuditScanUpdateInput): Promise<AuditScan> => {
    const rows = loadMock();
    let updatedRecord: AuditScan | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as AuditScan;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('AuditScan not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(auditScanMockData),

  uploadCreate: async (formData: FormData): Promise<AuditScan> => {
    const rows = loadMock();
    const record = { ...fromFormData(formData), [PRIMARY_KEY]: nextId(rows) } as unknown as AuditScan;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  uploadUpdate: async (id: string | number, formData: FormData): Promise<AuditScan> => {
    const rows = loadMock();
    let updatedRecord: AuditScan | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...fromFormData(formData) } as AuditScan;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('AuditScan not found');
    return delay(updatedRecord);
  },

  downloadUrl: (id: string | number): string => {
    const rows = loadMock();
    const row = rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id));
    return row ? String((row as unknown as Record<string, unknown>).report_file ?? '') : '';
  },
};

export const auditScanService =
  DATA_SOURCE === 'live'
    ? {
        list: auditScanApi.list,
        getById: auditScanApi.getById,
        create: auditScanApi.create,
        update: auditScanApi.update,
        remove: auditScanApi.remove,
        reset: () => undefined,
        uploadCreate: auditScanApi.uploadCreate,
        uploadUpdate: auditScanApi.uploadUpdate,
        downloadUrl: auditScanApi.downloadUrl,
      }
    : mockService;
