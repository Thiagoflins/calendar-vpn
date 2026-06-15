import { AuthUser } from '@/types';
import { createClient } from '@/lib/supabase/client';

export const authService = {
  async signIn(email: string, password: string): Promise<AuthUser> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const { data: profile } = await supabase
      .from('profiles')
      .select('nome, role')
      .eq('id', data.user.id)
      .single();

    return {
      id: data.user.id,
      email: data.user.email!,
      nome: profile?.nome ?? undefined,
      role: profile?.role ?? 'membro',
    };
  },

  async signOut(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('nome, role')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email!,
      nome: profile?.nome ?? undefined,
      role: profile?.role ?? 'membro',
    };
  },
};
