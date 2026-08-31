import type { FirewallRule, FirewallRuleCreateInput, FirewallRuleUpdateInput } from '../types/FirewallRule';
import { firewallRuleMockData } from '../mock/FirewallRuleMock';
import { firewallRuleApi } from '../api/FirewallRuleApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_firewallRule';
const PRIMARY_KEY = 'firewall_rule_id' as const;

function loadMock(): FirewallRule[] {
  if (typeof window === 'undefined') return firewallRuleMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FirewallRule[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(firewallRuleMockData));
  return firewallRuleMockData;
}

function saveMock(rows: FirewallRule[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: FirewallRule[]): number {
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
  list: async (): Promise<FirewallRule[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<FirewallRule | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: FirewallRuleCreateInput): Promise<FirewallRule> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as FirewallRule;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: FirewallRuleUpdateInput): Promise<FirewallRule> => {
    const rows = loadMock();
    let updatedRecord: FirewallRule | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as FirewallRule;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('FirewallRule not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(firewallRuleMockData),
};

export const firewallRuleService =
  DATA_SOURCE === 'live'
    ? {
        list: firewallRuleApi.list,
        getById: firewallRuleApi.getById,
        create: firewallRuleApi.create,
        update: firewallRuleApi.update,
        remove: firewallRuleApi.remove,
        reset: () => undefined,
      }
    : mockService;
