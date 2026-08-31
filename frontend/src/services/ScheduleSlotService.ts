import type { ScheduleSlot, ScheduleSlotCreateInput, ScheduleSlotUpdateInput } from '../types/ScheduleSlot';
import { scheduleSlotMockData } from '../mock/ScheduleSlotMock';
import { scheduleSlotApi } from '../api/ScheduleSlotApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_scheduleSlot';
const PRIMARY_KEY = 'schedule_slot_id' as const;

function loadMock(): ScheduleSlot[] {
  if (typeof window === 'undefined') return scheduleSlotMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ScheduleSlot[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduleSlotMockData));
  return scheduleSlotMockData;
}

function saveMock(rows: ScheduleSlot[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: ScheduleSlot[]): number {
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
  list: async (): Promise<ScheduleSlot[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<ScheduleSlot | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: ScheduleSlotCreateInput): Promise<ScheduleSlot> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as ScheduleSlot;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: ScheduleSlotUpdateInput): Promise<ScheduleSlot> => {
    const rows = loadMock();
    let updatedRecord: ScheduleSlot | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as ScheduleSlot;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('ScheduleSlot not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(scheduleSlotMockData),
};

export const scheduleSlotService =
  DATA_SOURCE === 'live'
    ? {
        list: scheduleSlotApi.list,
        getById: scheduleSlotApi.getById,
        create: scheduleSlotApi.create,
        update: scheduleSlotApi.update,
        remove: scheduleSlotApi.remove,
        reset: () => undefined,
      }
    : mockService;
