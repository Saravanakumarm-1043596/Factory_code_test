import type { PredictiveModel, PredictiveModelCreateInput, PredictiveModelUpdateInput } from '../types/PredictiveModel';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const ROUTE = `${BASE_URL}/api/predictivemodels`;

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? body.message ?? detail;
    } catch {
      // ignore -- non-JSON error body
    }
    throw new Error(`PredictiveModel API error (${res.status}): ${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const predictiveModelApi = {
  list: () => fetch(ROUTE).then((r) => handle<PredictiveModel[]>(r)),

  getById: (id: string | number) =>
    fetch(`${ROUTE}/${id}`).then((r) => handle<PredictiveModel>(r)),

  create: (input: PredictiveModelCreateInput) =>
    fetch(ROUTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then((r) => handle<PredictiveModel>(r)),

  update: (id: string | number, input: PredictiveModelUpdateInput) =>
    fetch(`${ROUTE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then((r) => handle<PredictiveModel>(r)),

  remove: (id: string | number) =>
    fetch(`${ROUTE}/${id}`, { method: 'DELETE' }).then((r) => handle<void>(r)),

  uploadCreate: (formData: FormData) =>
    fetch(ROUTE, {
      method: 'POST',
      body: formData,
    }).then((r) => handle<PredictiveModel>(r)),

  uploadUpdate: (id: string | number, formData: FormData) =>
    fetch(`${ROUTE}/${id}`, {
      method: 'PUT',
      body: formData,
    }).then((r) => handle<PredictiveModel>(r)),

  downloadUrl: (id: string | number) => `${ROUTE}/${id}/download`,
};
