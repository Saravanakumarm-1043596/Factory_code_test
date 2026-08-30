import type { LabTestOrder, LabTestOrderCreateInput, LabTestOrderUpdateInput } from '../types/LabTestOrder';
import { labTestOrderMockData } from '../mock/LabTestOrderMock';
import { labTestOrderApi } from '../api/LabTestOrderApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_labTestOrder';
const PRIMARY_KEY = 'lab_test_order_id' as const;

function loadMock(): LabTestOrder[] {
  if (typeof window === 'undefined') return labTestOrderMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LabTestOrder[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(labTestOrderMockData));
  return labTestOrderMockData;
}

function saveMock(rows: LabTestOrder[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: LabTestOrder[]): number {
  const numericIds = rows
    .map((r) => (r as unknown as Record<string, unknown>)[PRIMARY_KEY])
    .filter((v): v is number => typeof v === 'number');
  return (numericIds.length ? Math.max(...numericIds) : 0) + 1;
}

async function delay<T>(value: T): Promise<T> {
  // Tiny artificial latency so loading states are visible even in mock mode.
  return new Promise((resolve) => setTimeout(() => resolve(value), 180));
}

const mockService = {
  list: async (): Promise<LabTestOrder[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<LabTestOrder | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: LabTestOrderCreateInput): Promise<LabTestOrder> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as LabTestOrder;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: LabTestOrderUpdateInput): Promise<LabTestOrder> => {
    const rows = loadMock();
    let updatedRecord: LabTestOrder | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as LabTestOrder;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('LabTestOrder not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(labTestOrderMockData),
};

export const labTestOrderService =
  DATA_SOURCE === 'live'
    ? {
        list: labTestOrderApi.list,
        getById: labTestOrderApi.getById,
        create: labTestOrderApi.create,
        update: labTestOrderApi.update,
        remove: labTestOrderApi.remove,
        reset: () => undefined,
      }
    : mockService;
