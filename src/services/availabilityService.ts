// HANDOFF: trocar corpo por Supabase, manter assinaturas.
import { Availability } from '@/types';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
let store: Availability[] = [];

export const availabilityService = {
  async listByPerson(pessoaId: string): Promise<Availability[]> {
    await sleep(200);
    return store.filter(a => a.pessoaId === pessoaId);
  },

  async listByRange(from: string, to: string): Promise<Availability[]> {
    await sleep(200);
    return store.filter(a => a.dataFim >= from && a.dataInicio <= to);
  },

  async create(item: Omit<Availability, 'id'>): Promise<Availability> {
    await sleep(300);
    const created: Availability = { ...item, id: crypto.randomUUID() };
    store = [...store, created];
    return created;
  },

  async remove(id: string): Promise<void> {
    await sleep(200);
    store = store.filter(a => a.id !== id);
  },
};
