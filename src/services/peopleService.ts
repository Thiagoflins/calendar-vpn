import { Person } from '@/types';
import { createClient } from '@/lib/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toP(row: any, teamIds?: string[]): Person {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email ?? undefined,
    telefone: row.telefone ?? undefined,
    funcoes: row.funcoes ?? [],
    equipeIds: teamIds ?? (row.team_members ?? []).map((m: { team_id: string }) => m.team_id),
    ativo: row.ativo,
    observacao: row.observacao ?? undefined,
    criadoEm: row.criado_em ?? undefined,
  };
}

export const peopleService = {
  async list(params?: { ativo?: boolean }): Promise<Person[]> {
    const supabase = createClient();
    let q = supabase.from('people').select('*, team_members(team_id)').order('nome');
    if (params?.ativo !== undefined) q = q.eq('ativo', params.ativo);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map(row => toP(row));
  },

  async getById(id: string): Promise<Person | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('people').select('*').eq('id', id).single();
    if (error) return null;
    const { data: members } = await supabase.from('team_members').select('team_id').eq('person_id', id);
    return toP(data, (members ?? []).map((m: { team_id: string }) => m.team_id));
  },

  async create(p: Omit<Person, 'id'>): Promise<Person> {
    const supabase = createClient();
    const { data, error } = await supabase.from('people').insert({
      nome: p.nome,
      email: p.email,
      telefone: p.telefone,
      funcoes: p.funcoes,
      ativo: p.ativo,
      observacao: p.observacao,
    }).select().single();
    if (error) throw new Error(error.message);
    return toP(data, []);
  },

  async update(id: string, patch: Partial<Person>): Promise<Person> {
    const supabase = createClient();
    const { data, error } = await supabase.from('people').update({
      ...(patch.nome !== undefined && { nome: patch.nome }),
      ...(patch.email !== undefined && { email: patch.email }),
      ...(patch.telefone !== undefined && { telefone: patch.telefone }),
      ...(patch.funcoes !== undefined && { funcoes: patch.funcoes }),
      ...(patch.ativo !== undefined && { ativo: patch.ativo }),
      ...(patch.observacao !== undefined && { observacao: patch.observacao }),
    }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    const { data: members } = await supabase.from('team_members').select('team_id').eq('person_id', id);
    return toP(data, (members ?? []).map((m: { team_id: string }) => m.team_id));
  },

  async deactivate(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('people').update({ ativo: false }).eq('id', id);
    if (error) throw new Error(error.message);
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('people').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
