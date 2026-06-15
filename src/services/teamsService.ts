import { Team } from '@/types';
import { createClient } from '@/lib/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toT(row: any, membroIds: string[]): Team {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao ?? undefined,
    cor: row.cor ?? undefined,
    liderId: row.lider_id ?? undefined,
    membroIds,
    criadoEm: row.criado_em ?? undefined,
  };
}

export const teamsService = {
  async list(): Promise<Team[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('teams').select('*').order('nome');
    if (error) throw new Error(error.message);

    const { data: members } = await supabase.from('team_members').select('team_id, person_id');

    return (data ?? []).map(row => {
      const membroIds = (members ?? [])
        .filter((m: { team_id: string }) => m.team_id === row.id)
        .map((m: { person_id: string }) => m.person_id);
      return toT(row, membroIds);
    });
  },

  async getById(id: string): Promise<Team | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('teams').select('*').eq('id', id).single();
    if (error) return null;
    const { data: members } = await supabase.from('team_members').select('person_id').eq('team_id', id);
    return toT(data, (members ?? []).map((m: { person_id: string }) => m.person_id));
  },

  async create(t: Omit<Team, 'id'>): Promise<Team> {
    const supabase = createClient();
    const { data, error } = await supabase.from('teams').insert({
      nome: t.nome,
      descricao: t.descricao,
      cor: t.cor,
      lider_id: t.liderId,
    }).select().single();
    if (error) throw new Error(error.message);
    return toT(data, []);
  },

  async update(id: string, patch: Partial<Team>): Promise<Team> {
    const supabase = createClient();
    const { data, error } = await supabase.from('teams').update({
      ...(patch.nome !== undefined && { nome: patch.nome }),
      ...(patch.descricao !== undefined && { descricao: patch.descricao }),
      ...(patch.cor !== undefined && { cor: patch.cor }),
      ...(patch.liderId !== undefined && { lider_id: patch.liderId }),
    }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    const { data: members } = await supabase.from('team_members').select('person_id').eq('team_id', id);
    return toT(data, (members ?? []).map((m: { person_id: string }) => m.person_id));
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async addMember(teamId: string, personId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('team_members').upsert({ team_id: teamId, person_id: personId });
    if (error) throw new Error(error.message);
  },

  async removeMember(teamId: string, personId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('team_members').delete().eq('team_id', teamId).eq('person_id', personId);
    if (error) throw new Error(error.message);
  },
};
