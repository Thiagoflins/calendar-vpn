// HANDOFF: trocar corpo por Supabase, manter assinaturas.
import { CalendarEvent, EventType } from '@/types';
import { MOCK_EVENTS } from '@/lib/mock/events.mock';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
let store: CalendarEvent[] = [...MOCK_EVENTS];

export const eventsService = {
  async list(params?: { from?: string; to?: string; type?: EventType }): Promise<CalendarEvent[]> {
    await sleep(300);
    return store.filter(e => {
      if (params?.from && e.data < params.from) return false;
      if (params?.to && e.data > params.to) return false;
      if (params?.type && e.type !== params.type) return false;
      return true;
    });
  },

  async getById(id: string): Promise<CalendarEvent | null> {
    await sleep(200);
    return store.find(e => e.id === id) ?? null;
  },

  async create(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    await sleep(300);
    const newEvent: CalendarEvent = { ...event, id: crypto.randomUUID(), criadoEm: new Date().toISOString() };
    store = [...store, newEvent];
    return newEvent;
  },

  async createMany(events: Omit<CalendarEvent, 'id'>[]): Promise<CalendarEvent[]> {
    await sleep(300);
    const created = events.map(e => ({ ...e, id: crypto.randomUUID(), criadoEm: new Date().toISOString() } as CalendarEvent));
    store = [...store, ...created];
    return created;
  },

  async update(id: string, patch: Partial<CalendarEvent>): Promise<CalendarEvent> {
    await sleep(300);
    const idx = store.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Event not found');
    store[idx] = { ...store[idx], ...patch, atualizadoEm: new Date().toISOString() };
    return store[idx];
  },

  async duplicate(id: string): Promise<CalendarEvent> {
    await sleep(300);
    const ev = store.find(e => e.id === id);
    if (!ev) throw new Error('Event not found');
    const dup: CalendarEvent = { ...ev, id: crypto.randomUUID(), nome: ev.nome + ' (cópia)', criadoEm: new Date().toISOString() };
    store = [...store, dup];
    return dup;
  },

  async remove(id: string): Promise<void> {
    await sleep(300);
    store = store.filter(e => e.id !== id);
  },
};
