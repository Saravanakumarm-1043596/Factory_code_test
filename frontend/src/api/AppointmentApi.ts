import type { Appointment, AppointmentCreateInput, AppointmentUpdateInput } from '../types/Appointment';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const ROUTE = `${BASE_URL}/api/appointments`;

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? body.message ?? detail;
    } catch {
      // ignore -- non-JSON error body
    }
    throw new Error(`Appointment API error (${res.status}): ${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const appointmentApi = {
  list: () => fetch(ROUTE).then((r) => handle<Appointment[]>(r)),

  getById: (id: string | number) =>
    fetch(`${ROUTE}/${id}`).then((r) => handle<Appointment>(r)),

  create: (input: AppointmentCreateInput) =>
    fetch(ROUTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then((r) => handle<Appointment>(r)),

  update: (id: string | number, input: AppointmentUpdateInput) =>
    fetch(`${ROUTE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then((r) => handle<Appointment>(r)),

  remove: (id: string | number) =>
    fetch(`${ROUTE}/${id}`, { method: 'DELETE' }).then((r) => handle<void>(r)),
};
