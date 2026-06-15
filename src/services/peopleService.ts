// HANDOFF: trocar corpo por Supabase, manter assinaturas.
import { Person } from '@/types';
import { MOCK_PEOPLE } from '@/lib/mock/people.mock';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
let store: Person[] = [...MOCK_PEOPLE];

export const peopleService = {
  async list(params?: { ativo?: boolean }): Promise<Person[]> {
    await sleep(300);
    if (params?.ativo !== undefined) return store.filter(p => p.ativo === params.ativo);
    return [...store];
  },

  async getById(id: string): Promise<Person | null> {
    await sleep(200);
    return store.find(p => p.id === id) ?? null;
  },

  async create(p: Omit<Person, 'id'>): Promise<Person> {
    await sleep(300);
    const created: Person = { ...p, id: crypto.randomUUID(), criadoEm: new Date().toISOString() };
    store = [...store, created];
    return created;
  },

  async update(id: string, patch: Partial<Person>): Promise<Person> {
    await sleep(300);
    const idx = store.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Person not found');
    store[idx] = { ...store[idx], ...patch };
    return store[idx];
  },

  async deactivate(id: string): Promise<void> {
    await sleep(300);
    const idx = store.findIndex(p => p.id === id);
    if (idx !== -1) store[idx] = { ...store[idx], ativo: false };
  },

  async remove(id: string): Promise<void> {
    await sleep(300);
    store = store.filter(p => p.id !== id);
  },
};
