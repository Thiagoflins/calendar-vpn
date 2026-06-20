'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const CSS = `
  @keyframes loginIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .reset-card { animation: loginIn 0.45s cubic-bezier(.22,.68,0,1.2) both; }

  .reset-input {
    width: 100%; height: 44px;
    padding: 0 14px;
    border-radius: 8px; border: 1px solid #E5E7EB;
    font-size: 14px; font-family: 'Outfit', sans-serif; color: #0F0E0C;
    background: #FFFFFF; outline: none; box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .reset-input:focus {
    border-color: #1C3568;
    box-shadow: 0 0 0 3px rgba(28,53,104,0.09);
  }
  .reset-input::placeholder { color: #C4BFB8; }

  .reset-btn {
    width: 100%; height: 46px;
    background: #1C3568; color: #fff;
    border: none; border-radius: 8px;
    font-size: 14px; font-weight: 500; font-family: 'Outfit', sans-serif;
    cursor: pointer; letter-spacing: 0.01em;
    transition: background 0.15s, transform 0.12s, box-shadow 0.15s;
  }
  .reset-btn:hover:not(:disabled) {
    background: #162A53;
    box-shadow: 0 4px 16px rgba(28,53,104,0.28);
    transform: translateY(-1px);
  }
  .reset-btn:active:not(:disabled) { transform: translateY(0); }
  .reset-btn:disabled { background: #8FA8D4; cursor: not-allowed; }

  .pwd-toggle {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: #C4BFB8; padding: 4px; display: flex; align-items: center;
    transition: color 0.13s; line-height: 0;
  }
  .pwd-toggle:hover { color: #6B6860; }
`;

function ResetSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'success'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setStatus('error');
      setErrorMsg('Link inválido ou expirado. Solicite um novo link na tela de login.');
      return;
    }
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setStatus('error');
        setErrorMsg('Link inválido ou expirado. Solicite um novo link na tela de login.');
      } else {
        setStatus('ready');
      }
    });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    if (newPass !== confirmPass) { setErrorMsg('As senhas não coincidem.'); return; }
    if (newPass.length < 6) { setErrorMsg('Mínimo 6 caracteres.'); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw new Error(error.message);
      setStatus('success');
      setTimeout(() => router.push('/home'), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#132549',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      fontFamily: "'Outfit', sans-serif",
    }}>
      <style>{CSS}</style>

      <div className="reset-card" style={{
        background: '#FFFFFF',
        borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 32px 96px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
        width: '100%', maxWidth: 420,
        padding: '48px 40px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <Image src="/logo-azul.png" alt="Logo VPN" width={36} height={36} style={{ borderRadius: 8, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 9, color: '#A8A59E', letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1.3 }}>
              Casa Apostólica
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#0F0E0C', lineHeight: 1.2 }}>
              Voz para as Nações
            </div>
          </div>
        </div>

        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 14, color: '#949390' }}>Verificando link…</div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: '#0F0E0C', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
              Link inválido
            </h1>
            <div style={{ padding: '14px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626', lineHeight: 1.5, marginBottom: 20 }}>
              {errorMsg}
            </div>
            <button
              onClick={() => router.push('/login')}
              className="reset-btn"
            >
              Voltar para o login
            </button>
          </div>
        )}

        {status === 'ready' && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: '#0F0E0C', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
              Redefinir senha
            </h1>
            <p style={{ fontSize: 13, color: '#949390', margin: '0 0 28px', fontWeight: 500 }}>
              Escolha uma nova senha para sua conta.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 400, color: '#1C3568', marginBottom: 6 }}>
                  Nova senha
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="reset-input"
                    type={showPwd ? 'text' : 'password'}
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Mínimo 6 caracteres"
                    style={{ paddingRight: 42 }}
                  />
                  <button type="button" className="pwd-toggle" onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20C7 20 2.73 16.39 1 12a10.07 10.07 0 012.06-3.94M9.9 4.24A9.12 9.12 0 0112 4c5 0 9.27 3.61 11 8a10.12 10.12 0 01-2.54 3.74M1 1l22 22"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M1 12C2.73 7.61 7 4 12 4s9.27 3.61 11 8c-1.73 4.39-6 8-11 8S2.73 16.39 1 12z"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 400, color: '#1C3568', marginBottom: 6 }}>
                  Confirmar nova senha
                </label>
                <input
                  className="reset-input"
                  type={showPwd ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Repita a nova senha"
                />
              </div>

              {errorMsg && (
                <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
                  {errorMsg}
                </div>
              )}

              <button type="submit" className="reset-btn" disabled={loading}>
                {loading ? 'Salvando…' : 'Salvar nova senha'}
              </button>
            </form>
          </div>
        )}

        {status === 'success' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#F0FDF4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
                <path d="M20 6L9 17L4 12" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0F0E0C', margin: '0 0 6px' }}>
              Senha redefinida!
            </h2>
            <p style={{ fontSize: 13, color: '#949390', margin: 0 }}>
              Redirecionando para o sistema…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetSenhaPage() {
  return (
    <Suspense>
      <ResetSenhaContent />
    </Suspense>
  );
}
