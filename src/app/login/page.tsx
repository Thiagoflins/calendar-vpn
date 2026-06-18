'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authService } from '@/services/authService';
import loginBg from './login-bg.jpg';

const CSS = `
  @keyframes loginIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .login-card { animation: loginIn 0.45s cubic-bezier(.22,.68,0,1.2) both; }
  .login-left-panel { display: flex; }
  @media (max-width: 600px) {
    .login-left-panel { display: none !important; }
    .login-card { min-height: unset !important; border-radius: 16px !important; }
    .login-right-panel { padding: 36px 28px !important; }
  }

  .login-input {
    width: 100%; height: 44px;
    padding: 0 14px;
    border-radius: 8px; border: 1px solid #E5E7EB;
    font-size: 14px; font-family: 'Outfit', sans-serif; color: #0F0E0C;
    background: #FFFFFF; outline: none; box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .login-input:focus {
    border-color: #1C3568;
    box-shadow: 0 0 0 3px rgba(28,53,104,0.09);
  }
  .login-input::placeholder { color: #C4BFB8; }

  .login-btn {
    width: 100%; height: 46px;
    background: #1C3568; color: #fff;
    border: none; border-radius: 8px;
    font-size: 14px; font-weight: 500; font-family: 'Outfit', sans-serif;
    cursor: pointer; letter-spacing: 0.01em;
    transition: background 0.15s, transform 0.12s, box-shadow 0.15s;
  }
  .login-btn:hover:not(:disabled) {
    background: #162A53;
    box-shadow: 0 4px 16px rgba(28,53,104,0.28);
    transform: translateY(-1px);
  }
  .login-btn:active:not(:disabled) { transform: translateY(0); }
  .login-btn:disabled { background: #8FA8D4; cursor: not-allowed; }

  .pwd-toggle {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: #C4BFB8; padding: 4px; display: flex; align-items: center;
    transition: color 0.13s; line-height: 0;
  }
  .pwd-toggle:hover { color: #6B6860; }

  .login-link {
    color: #1C3568; font-weight: 600; text-decoration: none;
    transition: opacity 0.13s;
  }
  .login-link:hover { opacity: 0.75; }
`;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.signIn(email, password);
      router.push('/home');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciais inválidas. Tente novamente.');
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

      <div className="login-card" style={{
        display: 'flex', width: '100%', maxWidth: 920, minHeight: 580,
        borderRadius: 6, overflow: 'hidden',
        boxShadow: '0 32px 96px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
      }}>

        {/* ── Painel Esquerdo ── */}
        <div className="login-left-panel" style={{
          width: '42%', flexShrink: 0,
          padding: '36px 40px',
          flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
          background: '#06101E',
          minHeight: 580,
        }}>
          {/* Foto de fundo */}
          <Image
            src={loginBg}
            alt=""
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
          {/* Dark overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(4,10,20,0.68) 0%, rgba(4,10,20,0.45) 40%, rgba(4,10,20,0.80) 100%)',
          }} />
          {/* Bottom vignette */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
            background: 'linear-gradient(to top, rgba(2,6,9,0.88) 0%, transparent 100%)',
            pointerEvents: 'none',  
          }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/logo-azul.png" alt="Logo VPN" width={42} height={42} style={{ borderRadius: 9, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.94)', letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1.3 }}>
                Casa Apostólica
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255, 255, 255, 0.98)', lineHeight: 1.2 }}>
                Voz para as Nações
              </div>
            </div>
          </div>

          {/* Bottom headline */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 42, fontWeight: 800,
              color: '#ffffff', margin: '0 0 12px',
              lineHeight: 1.0, letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}>
              HABILITAR<br />
              PARA O<br />
              <span style={{ color: '#2d62cd' }}>SENHOR</span><br />
              UM POVO<br />
              PREPARADO.
            </h2>
            <p style={{
              fontSize: 11, color: 'rgba(255,255,255,0.45)',
              margin: 0, letterSpacing: '0.18em',
              textTransform: 'uppercase', fontWeight: 500,
            }}>
              Lucas 1:17
            </p>
          </div>
        </div>

        {/* ── Painel Direito ── */}
        <div className="login-right-panel" style={{
          flex: 1, background: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '48px 56px',
        }}>
          <div style={{ width: '100%', maxWidth: 320 }}>

            {/* Heading */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 26, fontWeight: 500,
                color: '#0F0E0C', margin: '0 0 6px',
                letterSpacing: '-0.01em', lineHeight: 1.2,
              }}>
                Bem-vindo!
              </h1>
              <p style={{ fontSize: 13, color: '#C4BFB8', margin: 0, fontWeight: 500 }}>
                Entre com suas credenciais para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* E-mail */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 400, color: '#A8A59E', marginBottom: 6 }}>
                  E-mail
                </label>
                <input
                  className="login-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                />
              </div>

              {/* Senha */}
              <div style={{ marginBottom: 26 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 400, color: '#A8A59E', marginBottom: 6 }}>
                  Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="login-input"
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
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

              {/* Erro */}
              {error && (
                <div style={{ marginBottom: 18, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
                  {error}
                </div>
              )}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: '#A8A59E', margin: '22px 0 0' }}>
              Não tem conta?{' '}
              <Link href="/cadastro" className="login-link">
                Criar conta
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
