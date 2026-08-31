import type { Appointment, AppointmentCreateInput, AppointmentUpdateInput } from '../types/Appointment';
import { appointmentMockData } from '../mock/AppointmentMock';
import { appointmentApi } from '../api/AppointmentApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_appointment';
const PRIMARY_KEY = 'appointment_id' as const;

function loadMock(): Appointment[] {
  if (typeof window === 'undefined') return appointmentMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Appointment[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appointmentMockData));
  return appointmentMockData;
}

function saveMock(rows: Appointment[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: Appointment[]): number {
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
  list: async (): Promise<Appointment[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<Appointment | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: AppointmentCreateInput): Promise<Appointment> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as Appointment;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: AppointmentUpdateInput): Promise<Appointment> => {
    const rows = loadMock();
    let updatedRecord: Appointment | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as Appointment;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('Appointment not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(appointmentMockData),
};

export const appointmentService =
  DATA_SOURCE === 'live'
    ? {
        list: appointmentApi.list,
        getById: appointmentApi.getById,
        create: appointmentApi.create,
        update: appointmentApi.update,
        remove: appointmentApi.remove,
        reset: () => undefined,
      }
    : mockService;
