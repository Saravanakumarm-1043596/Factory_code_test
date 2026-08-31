import type { ConsentRecord, ConsentRecordCreateInput, ConsentRecordUpdateInput } from '../types/ConsentRecord';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const ROUTE = `${BASE_URL}/api/consentrecords`;

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? body.message ?? detail;
    } catch {
      // ignore -- non-JSON error body
    }
    throw new Error(`ConsentRecord API error (${res.status}): ${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const consentRecordApi = {
  list: () => fetch(ROUTE).then((r) => handle<ConsentRecord[]>(r)),

  getById: (id: string | number) =>
    fetch(`${ROUTE}/${id}`).then((r) => handle<ConsentRecord>(r)),

  create: (input: ConsentRecordCreateInput) =>
    fetch(ROUTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then((r) => handle<ConsentRecord>(r)),

  update: (id: string | number, input: ConsentRecordUpdateInput) =>
    fetch(`${ROUTE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then((r) => handle<ConsentRecord>(r)),

  remove: (id: string | number) =>
    fetch(`${ROUTE}/${id}`, { method: 'DELETE' }).then((r) => handle<void>(r)),

  uploadCreate: (formData: FormData) =>
    fetch(ROUTE, {
      method: 'POST',
      body: formData,
    }).then((r) => handle<ConsentRecord>(r)),

  uploadUpdate: (id: string | number, formData: FormData) =>
    fetch(`${ROUTE}/${id}`, {
      method: 'PUT',
      body: formData,
    }).then((r) => handle<ConsentRecord>(r)),

  downloadUrl: (id: string | number) => `${ROUTE}/${id}/download`,
};
