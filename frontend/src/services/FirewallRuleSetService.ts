import type { FirewallRuleSet, FirewallRuleSetCreateInput, FirewallRuleSetUpdateInput } from '../types/FirewallRuleSet';
import { firewallRuleSetMockData } from '../mock/FirewallRuleSetMock';
import { firewallRuleSetApi } from '../api/FirewallRuleSetApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_firewallRuleSet';
const PRIMARY_KEY = 'firewall_rule_set_id' as const;

function loadMock(): FirewallRuleSet[] {
  if (typeof window === 'undefined') return firewallRuleSetMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FirewallRuleSet[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(firewallRuleSetMockData));
  return firewallRuleSetMockData;
}

function saveMock(rows: FirewallRuleSet[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: FirewallRuleSet[]): number {
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
  list: async (): Promise<FirewallRuleSet[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<FirewallRuleSet | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: FirewallRuleSetCreateInput): Promise<FirewallRuleSet> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as FirewallRuleSet;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: FirewallRuleSetUpdateInput): Promise<FirewallRuleSet> => {
    const rows = loadMock();
    let updatedRecord: FirewallRuleSet | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as FirewallRuleSet;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('FirewallRuleSet not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(firewallRuleSetMockData),
};

export const firewallRuleSetService =
  DATA_SOURCE === 'live'
    ? {
        list: firewallRuleSetApi.list,
        getById: firewallRuleSetApi.getById,
        create: firewallRuleSetApi.create,
        update: firewallRuleSetApi.update,
        remove: firewallRuleSetApi.remove,
        reset: () => undefined,
      }
    : mockService;
