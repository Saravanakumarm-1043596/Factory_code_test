import type { RuleIssue, RuleIssueCreateInput, RuleIssueUpdateInput } from '../types/RuleIssue';
import { ruleIssueMockData } from '../mock/RuleIssueMock';
import { ruleIssueApi } from '../api/RuleIssueApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_ruleIssue';
const PRIMARY_KEY = 'rule_issue_id' as const;

function loadMock(): RuleIssue[] {
  if (typeof window === 'undefined') return ruleIssueMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as RuleIssue[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ruleIssueMockData));
  return ruleIssueMockData;
}

function saveMock(rows: RuleIssue[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: RuleIssue[]): number {
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
  list: async (): Promise<RuleIssue[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<RuleIssue | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: RuleIssueCreateInput): Promise<RuleIssue> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as RuleIssue;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: RuleIssueUpdateInput): Promise<RuleIssue> => {
    const rows = loadMock();
    let updatedRecord: RuleIssue | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as RuleIssue;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('RuleIssue not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(ruleIssueMockData),
};

export const ruleIssueService =
  DATA_SOURCE === 'live'
    ? {
        list: ruleIssueApi.list,
        getById: ruleIssueApi.getById,
        create: ruleIssueApi.create,
        update: ruleIssueApi.update,
        remove: ruleIssueApi.remove,
        reset: () => undefined,
      }
    : mockService;
