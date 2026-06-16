import { createClient } from '@/lib/supabase/client';

export type Funcao = { id: string; nome: string };

export const funcoesService = {
  async list(): Promise<Funcao[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('funcoes')
      .select('id, nome')
      .order('nome');
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async create(nome: string): Promise<Funcao> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('funcoes')
      .insert({ nome: nome.trim() })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, nome: string): Promise<Funcao> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('funcoes')
      .update({ nome: nome.trim() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('funcoes').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
