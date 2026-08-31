import type { NetworkSecurityGroup, NetworkSecurityGroupCreateInput, NetworkSecurityGroupUpdateInput } from '../types/NetworkSecurityGroup';
import { networkSecurityGroupMockData } from '../mock/NetworkSecurityGroupMock';
import { networkSecurityGroupApi } from '../api/NetworkSecurityGroupApi';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase();
const STORAGE_KEY = 'uisenz_mock_networkSecurityGroup';
const PRIMARY_KEY = 'network_security_group_id' as const;

function loadMock(): NetworkSecurityGroup[] {
  if (typeof window === 'undefined') return networkSecurityGroupMockData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as NetworkSecurityGroup[];
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(networkSecurityGroupMockData));
  return networkSecurityGroupMockData;
}

function saveMock(rows: NetworkSecurityGroup[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function nextId(rows: NetworkSecurityGroup[]): number {
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
  list: async (): Promise<NetworkSecurityGroup[]> => delay(loadMock()),

  getById: async (id: string | number): Promise<NetworkSecurityGroup | undefined> => {
    const rows = loadMock();
    return delay(rows.find((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)));
  },

  create: async (input: NetworkSecurityGroupCreateInput): Promise<NetworkSecurityGroup> => {
    const rows = loadMock();
    const record = { ...(input as object), [PRIMARY_KEY]: nextId(rows) } as unknown as NetworkSecurityGroup;
    const updated = [record, ...rows];
    saveMock(updated);
    return delay(record);
  },

  update: async (id: string | number, input: NetworkSecurityGroupUpdateInput): Promise<NetworkSecurityGroup> => {
    const rows = loadMock();
    let updatedRecord: NetworkSecurityGroup | undefined;
    const updated = rows.map((r) => {
      if (String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) === String(id)) {
        updatedRecord = { ...r, ...input } as NetworkSecurityGroup;
        return updatedRecord;
      }
      return r;
    });
    saveMock(updated);
    if (!updatedRecord) throw new Error('NetworkSecurityGroup not found');
    return delay(updatedRecord);
  },

  remove: async (id: string | number): Promise<void> => {
    const rows = loadMock();
    saveMock(rows.filter((r) => String((r as unknown as Record<string, unknown>)[PRIMARY_KEY]) !== String(id)));
    return delay(undefined);
  },

  reset: (): void => saveMock(networkSecurityGroupMockData),
};

export const networkSecurityGroupService =
  DATA_SOURCE === 'live'
    ? {
        list: networkSecurityGroupApi.list,
        getById: networkSecurityGroupApi.getById,
        create: networkSecurityGroupApi.create,
        update: networkSecurityGroupApi.update,
        remove: networkSecurityGroupApi.remove,
        reset: () => undefined,
      }
    : mockService;
