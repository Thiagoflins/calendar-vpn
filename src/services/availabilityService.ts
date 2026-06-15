import { Availability } from '@/types';
import { createClient } from '@/lib/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toA(row: any): Availability {
  return {
    id: row.id,
    pessoaId: row.pessoa_id,
    dataInicio: row.data_inicio,
    dataFim: row.data_fim,
    motivo: row.motivo ?? undefined,
  };
}

export const availabilityService = {
  async listByPerson(pessoaId: string): Promise<Availability[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('availability').select('*').eq('pessoa_id', pessoaId);
    if (error) throw new Error(error.message);
    return (data ?? []).map(toA);
  },

  async listByRange(from: string, to: string): Promise<Availability[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .lte('data_inicio', to)
      .gte('data_fim', from);
    if (error) throw new Error(error.message);
    return (data ?? []).map(toA);
  },

  async create(item: Omit<Availability, 'id'>): Promise<Availability> {
    const supabase = createClient();
    const { data, error } = await supabase.from('availability').insert({
      pessoa_id: item.pessoaId,
      data_inicio: item.dataInicio,
      data_fim: item.dataFim,
      motivo: item.motivo,
    }).select().single();
    if (error) throw new Error(error.message);
    return toA(data);
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('availability').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
