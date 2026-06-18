'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { authService } from '@/services/authService';
import { AuthUser } from '@/types';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  lider: 'Líder',
  membro: 'Membro',
};

function initials(nome?: string, email?: string) {
  const src = nome || email || '?';
  return src.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function SectionCard({ title, action, children }: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(16,24,40,0.04)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{title}</div>
        {action}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{value || '—'}</div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', disabled, placeholder }: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; disabled?: boolean; placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 5 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: disabled ? '#F9FAFB' : '#fff',
          border: '1px solid #D1D5DB', borderRadius: 6,
          padding: '8px 12px', fontSize: 14, color: disabled ? '#9CA3AF' : '#111827',
          outline: 'none', cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
    </div>
  );
}

export default function ContaPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [nome, setNome] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [editingPass, setEditingPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    authService.getCurrentUser().then(u => {
      if (!u) { router.push('/login'); return; }
      setUser(u);
      setNome(u.nome ?? '');
    });
  }, [router]);

  async function saveProfile() {
    setProfileMsg(''); setProfileErr('');
    setProfileLoading(true);
    try {
      await authService.updateProfile(nome);
      setUser(u => u ? { ...u, nome } : u);
      setProfileMsg('Nome atualizado com sucesso.');
      setEditingProfile(false);
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setProfileLoading(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassMsg(''); setPassErr('');
    if (newPass !== confirmPass) { setPassErr('As senhas não coincidem.'); return; }
    if (newPass.length < 6) { setPassErr('Mínimo 6 caracteres.'); return; }
    setPassLoading(true);
    try {
      await authService.updatePassword(newPass);
      setPassMsg('Senha alterada com sucesso.');
      setNewPass(''); setConfirmPass('');
      setEditingPass(false);
    } catch (err) {
      setPassErr(err instanceof Error ? err.message : 'Erro ao alterar senha.');
    } finally {
      setPassLoading(false);
    }
  }

  if (!user) return <AppShell><div /></AppShell>;

  return (
    <AppShell>
      <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20 }}>
          Sistema / <span style={{ color: '#2E5AAC' }}>Minha Conta</span>
        </div>

        {/* Header card */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(16,24,40,0.04)', padding: '24px 28px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#2E5AAC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {initials(user.nome, user.email)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{user.nome || '—'}</div>
            <div style={{ fontSize: 13, color: '#2E5AAC', fontWeight: 500, marginTop: 2 }}>{ROLE_LABEL[user.role] ?? user.role}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 48px', borderLeft: '1px solid #E5E7EB', paddingLeft: 28 }}>
            {[
              { label: 'E-mail', value: user.email },
              { label: 'Perfil', value: ROLE_LABEL[user.role] ?? user.role },
              { label: 'ID da conta', value: user.id.slice(0, 8).toUpperCase() },
              { label: 'Membro desde', value: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid de seções */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Informações da conta */}
          <SectionCard
            title="Informações da conta"
            action={
              <button
                onClick={() => { setEditingProfile(p => !p); setProfileMsg(''); setProfileErr(''); if (editingProfile) setNome(user.nome ?? ''); }}
                style={{ fontSize: 12, fontWeight: 500, color: '#2E5AAC', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 5, transition: 'background 0.13s, color 0.13s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F0F4FF'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                {editingProfile ? 'Cancelar' : 'Editar'}
              </button>
            }
          >
            {!editingProfile ? (
              <div>
                <FieldRow label="Nome completo" value={user.nome ?? '—'} />
                <FieldRow label="E-mail" value={user.email} />
                <FieldRow label="Perfil" value={ROLE_LABEL[user.role] ?? user.role} />
              </div>
            ) : (
              <div>
                <InputField label="Nome completo" value={nome} onChange={setNome} />
                <InputField label="E-mail" value={user.email} disabled />
                <InputField label="Perfil" value={ROLE_LABEL[user.role] ?? user.role} disabled />
                {profileErr && <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 10 }}>{profileErr}</div>}
                {profileMsg && <div style={{ fontSize: 12, color: '#10B981', marginBottom: 10 }}>{profileMsg}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={saveProfile} disabled={profileLoading} style={{ padding: '7px 18px', background: '#2E5AAC', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.13s, transform 0.12s, box-shadow 0.13s' }}
                  onMouseEnter={e => { if (!profileLoading) { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#23478A'; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 4px 14px rgba(46,90,172,0.32)'; } }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#2E5AAC'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
                >
                    {profileLoading ? 'Salvando…' : 'Salvar'}
                  </button>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Segurança */}
          <SectionCard
            title="Segurança"
            action={
              <button
                onClick={() => { setEditingPass(p => !p); setPassMsg(''); setPassErr(''); setNewPass(''); setConfirmPass(''); }}
                style={{ fontSize: 12, fontWeight: 500, color: '#2E5AAC', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 5, transition: 'background 0.13s, color 0.13s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F0F4FF'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                {editingPass ? 'Cancelar' : 'Alterar senha'}
              </button>
            }
          >
            {!editingPass ? (
              <div>
                <FieldRow label="Senha" value="••••••••" />
                {passMsg && <div style={{ fontSize: 12, color: '#10B981', marginTop: 10 }}>{passMsg}</div>}
              </div>
            ) : (
              <form onSubmit={savePassword}>
                <InputField label="Nova senha" value={newPass} onChange={setNewPass} type="password" placeholder="Mínimo 6 caracteres" />
                <InputField label="Confirmar nova senha" value={confirmPass} onChange={setConfirmPass} type="password" placeholder="Repita a nova senha" />
                {passErr && <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 10 }}>{passErr}</div>}
                <button type="submit" disabled={passLoading} style={{ padding: '7px 18px', background: '#2E5AAC', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.13s, transform 0.12s, box-shadow 0.13s' }}
                  onMouseEnter={e => { if (!passLoading) { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#23478A'; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 4px 14px rgba(46,90,172,0.32)'; } }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#2E5AAC'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
                >
                  {passLoading ? 'Alterando…' : 'Salvar senha'}
                </button>
              </form>
            )}
          </SectionCard>
        </div>

        {/* Sessão */}
        <SectionCard title="Sessão">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, color: '#6B7280' }}>Encerrar a sessão atual e voltar para a tela de login.</div>
            <button
              onClick={async () => { await authService.signOut(); router.push('/login'); }}
              style={{ padding: '7px 20px', background: '#fff', color: '#EF4444', border: '1px solid #FECACA', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.13s, border-color 0.13s, transform 0.12s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#FEF2F2'; el.style.borderColor = '#FCA5A5'; el.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#fff'; el.style.borderColor = '#FECACA'; el.style.transform = 'translateY(0)'; }}
            >
              Sair da conta
            </button>
          </div>
        </SectionCard>

      </div>
    </AppShell>
  );
}
