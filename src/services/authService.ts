// HANDOFF: trocar corpo por Supabase, manter assinaturas.
import { AuthUser } from '@/types';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const MOCK_USER: AuthUser = {
  id: 'u1',
  email: 'roberto@vpn.com',
  nome: 'Pr. Roberto Silva',
  role: 'admin',
};

export const authService = {
  async signIn(email: string, password: string): Promise<AuthUser> {
    await sleep(500);
    void email; void password;
    return MOCK_USER;
  },

  async signOut(): Promise<void> {
    await sleep(200);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    await sleep(100);
    return MOCK_USER;
  },
};
