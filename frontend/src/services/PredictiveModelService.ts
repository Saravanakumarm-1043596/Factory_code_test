import type { PredictiveModel, PredictiveModelCreateInput, PredictiveModelUpdateInput } from '../types/PredictiveModel';
import { predictiveModelMockData } from '../mock/PredictiveModelMock';
import { predictiveModelApi } from '../api/PredictiveModelApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_predictiveModel';
const PRIMARY_KEY = 'predictive_model_id' as const;

function loadMock(): PredictiveModel[] {
  if (typeof window === 'undefined') return predictiveModelMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PredictiveModel[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(predictiveModelMockData));
  return predictiveModelMockData;
}

function saveMock(rows: PredictiveModel[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: PredictiveModel[]): number {
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
  if (typeof obj.accuracy_score === 'string' && obj.accuracy_score !== '') obj.accuracy_score = Number(obj.accuracy_score);
  if (typeof obj.auc_roc_score === 'string' && obj.auc_roc_score !== '') obj.auc_roc_score = Number(obj.auc_roc_score);
  if (typeof obj.training_record_count === 'string' && obj.training_record_count !== '') obj.training_record_count = Number(obj.training_record_count);
  return obj;
}

const mockService = {
  list: async (): Promise<PredictiveModel[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<PredictiveModel | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: PredictiveModelCreateInput): Promise<PredictiveModel> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as PredictiveModel;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: PredictiveModelUpdateInput): Promise<PredictiveModel> => {
    const rows = loadMock();
    let updatedRecord: PredictiveModel | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as PredictiveModel;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('PredictiveModel not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(predictiveModelMockData),

  uploadCreate: async (formData: FormData): Promise<PredictiveModel> => {
    const rows = loadMock();
    const record = { ...fromFormData(formData), [PRIMARY_KEY]: nextId(rows) } as unknown as PredictiveModel;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  uploadUpdate: async (id: string | number, formData: FormData): Promise<PredictiveModel> => {
    const rows = loadMock();
    let updatedRecord: PredictiveModel | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...fromFormData(formData) } as PredictiveModel;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('PredictiveModel not found');
    return delay(updatedRecord);
  },

  downloadUrl: (id: string | number): string => {
    const rows = loadMock();
    const row = rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id));
    return row ? String((row as unknown as Record<string, unknown>).model_artifact ?? '') : '';
  },
};

export const predictiveModelService =
  DATA_SOURCE === 'live'
    ? {
        list: predictiveModelApi.list,
        getById: predictiveModelApi.getById,
        create: predictiveModelApi.create,
        update: predictiveModelApi.update,
        remove: predictiveModelApi.remove,
        reset: () => undefined,
        uploadCreate: predictiveModelApi.uploadCreate,
        uploadUpdate: predictiveModelApi.uploadUpdate,
        downloadUrl: predictiveModelApi.downloadUrl,
      }
    : mockService;
