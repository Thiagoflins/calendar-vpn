import { TeamType } from '@/types';
import { createClient } from '@/lib/supabase/client';

export const teamTypesService = {
  async list(): Promise<TeamType[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('team_types').select('*').order('nome');
    if (error) throw new Error(error.message);
    return (data ?? []).map(row => ({ id: row.id, nome: row.nome }));
  },

  async create(nome: string): Promise<TeamType> {
    const supabase = createClient();
    const { data, error } = await supabase.from('team_types').insert({ nome }).select().single();
    if (error) throw new Error(error.message);
    return { id: data.id, nome: data.nome };
  },

  async update(id: string, nome: string): Promise<TeamType> {
    const supabase = createClient();
    const { data, error } = await supabase.from('team_types').update({ nome }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { id: data.id, nome: data.nome };
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('team_types').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
