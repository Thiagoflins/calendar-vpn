import { CalendarEvent, EventType } from '@/types';
import { createClient } from '@/lib/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toE(row: any): CalendarEvent {
  return {
    id: row.id,
    type: row.type,
    nome: row.nome,
    descricao: row.descricao ?? undefined,
    data: row.data,
    hora: row.hora,
    cor: row.cor,
    observacao: row.observacao ?? undefined,
    pastor: row.pastor ?? undefined,
    responsavel: row.responsavel ?? undefined,
    adoracao: row.adoracao ?? undefined,
    organizacao: row.organizacao ?? undefined,
    equipe: row.equipe ?? undefined,
    repetir: row.repetir ?? undefined,
    repetirQtd: row.repetir_qtd ?? undefined,
    recorrenciaOrigem: row.recorrencia_origem ?? undefined,
    criadoEm: row.criado_em ?? undefined,
    atualizadoEm: row.atualizado_em ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRow(e: Omit<CalendarEvent, 'id'>): Record<string, any> {
  return {
    type: e.type,
    nome: e.nome,
    descricao: e.descricao,
    data: e.data,
    hora: e.hora,
    cor: e.cor,
    observacao: e.observacao,
    pastor: e.pastor,
    responsavel: e.responsavel,
    adoracao: e.adoracao,
    organizacao: e.organizacao,
    equipe: e.equipe,
    repetir: e.repetir,
    repetir_qtd: e.repetirQtd,
    recorrencia_origem: e.recorrenciaOrigem,
  };
}

export const eventsService = {
  async list(params?: { from?: string; to?: string; type?: EventType }): Promise<CalendarEvent[]> {
    const supabase = createClient();
    let q = supabase.from('events').select('*').order('data').order('hora');
    if (params?.from) q = q.gte('data', params.from);
    if (params?.to) q = q.lte('data', params.to);
    if (params?.type) q = q.eq('type', params.type);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map(toE);
  },

  async getById(id: string): Promise<CalendarEvent | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
    if (error) return null;
    return toE(data);
  },

  async create(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user.id;
    const { data, error } = await supabase.from('events').insert({ ...toRow(event), ...(userId && { criado_por: userId }) }).select().single();
    if (error) throw new Error(error.message);
    return toE(data);
  },

  async createMany(events: Omit<CalendarEvent, 'id'>[]): Promise<CalendarEvent[]> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user.id;
    const rows = events.map(e => ({ ...toRow(e), ...(userId && { criado_por: userId }) }));
    const { data, error } = await supabase.from('events').insert(rows).select();
    if (error) throw new Error(error.message);
    return (data ?? []).map(toE);
  },

  async update(id: string, patch: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user.id;
    const { data, error } = await supabase.from('events').update({
      ...(patch.type !== undefined && { type: patch.type }),
      ...(patch.nome !== undefined && { nome: patch.nome }),
      ...(patch.descricao !== undefined && { descricao: patch.descricao }),
      ...(patch.data !== undefined && { data: patch.data }),
      ...(patch.hora !== undefined && { hora: patch.hora }),
      ...(patch.cor !== undefined && { cor: patch.cor }),
      ...(patch.observacao !== undefined && { observacao: patch.observacao }),
      ...(patch.pastor !== undefined && { pastor: patch.pastor }),
      ...(patch.responsavel !== undefined && { responsavel: patch.responsavel }),
      ...(patch.adoracao !== undefined && { adoracao: patch.adoracao }),
      ...(patch.organizacao !== undefined && { organizacao: patch.organizacao }),
      ...(patch.equipe !== undefined && { equipe: patch.equipe }),
      ...(patch.repetir !== undefined && { repetir: patch.repetir }),
      ...(patch.repetirQtd !== undefined && { repetir_qtd: patch.repetirQtd }),
      ...(userId && { atualizado_por: userId }),
    }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return toE(data);
  },

  async duplicate(id: string): Promise<CalendarEvent> {
    const supabase = createClient();
    const { data: ev, error: fetchErr } = await supabase.from('events').select('*').eq('id', id).single();
    if (fetchErr || !ev) throw new Error('Event not found');
    const { id: _id, criado_em: _c, atualizado_em: _a, ...rest } = ev;
    const { data, error } = await supabase.from('events').insert({
      ...rest,
      nome: ev.nome + ' (cópia)',
      recorrencia_origem: id,
    }).select().single();
    if (error) throw new Error(error.message);
    return toE(data);
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
