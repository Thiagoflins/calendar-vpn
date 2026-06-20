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

  async signUp(email: string, password: string, nome: string): Promise<AuthUser> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome } },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Erro ao criar conta.');

    return {
      id: data.user.id,
      email: data.user.email!,
      nome,
      role: 'membro',
    };
  },

  async updateProfile(nome: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado.');
    const { error } = await supabase.from('profiles').update({ nome }).eq('id', user.id);
    if (error) throw new Error(error.message);
  },

  async updatePassword(newPassword: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  },

  async resetPassword(email: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-senha`,
    });
    if (error) throw new Error(error.message);
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
