// HANDOFF: trocar corpo por Supabase, manter assinaturas.
import { Team } from '@/types';
import { MOCK_TEAMS } from '@/lib/mock/teams.mock';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
let store: Team[] = [...MOCK_TEAMS];

export const teamsService = {
  async list(): Promise<Team[]> {
    await sleep(300);
    return [...store];
  },

  async getById(id: string): Promise<Team | null> {
    await sleep(200);
    return store.find(t => t.id === id) ?? null;
  },

  async create(t: Omit<Team, 'id'>): Promise<Team> {
    await sleep(300);
    const created: Team = { ...t, id: crypto.randomUUID(), criadoEm: new Date().toISOString() };
    store = [...store, created];
    return created;
  },

  async update(id: string, patch: Partial<Team>): Promise<Team> {
    await sleep(300);
    const idx = store.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Team not found');
    store[idx] = { ...store[idx], ...patch };
    return store[idx];
  },

  async remove(id: string): Promise<void> {
    await sleep(300);
    store = store.filter(t => t.id !== id);
  },

  async addMember(teamId: string, personId: string): Promise<void> {
    await sleep(200);
    const idx = store.findIndex(t => t.id === teamId);
    if (idx !== -1 && !store[idx].membroIds.includes(personId)) {
      store[idx] = { ...store[idx], membroIds: [...store[idx].membroIds, personId] };
    }
  },

  async removeMember(teamId: string, personId: string): Promise<void> {
    await sleep(200);
    const idx = store.findIndex(t => t.id === teamId);
    if (idx !== -1) {
      store[idx] = { ...store[idx], membroIds: store[idx].membroIds.filter(id => id !== personId) };
    }
  },
};
