'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { authService } from '@/services/authService';
import loginBg from '../login/login-bg.jpg';

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

  .login-link {
    color: #1C3568; font-weight: 600; text-decoration: none;
    transition: opacity 0.13s;
  }
  .login-link:hover { opacity: 0.75; }
`;

export default function CadastroPage() {
  const [nome, setNome]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.signUp(email, password, nome);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.');
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

        {/* ── Painel Esquerdo (idêntico ao login) ── */}
        <div className="login-left-panel" style={{
          width: '42%', flexShrink: 0,
          padding: '36px 40px',
          flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
          background: '#06101E',
          minHeight: 580,
        }}>
          <Image
            src={loginBg}
            alt=""
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(4,10,20,0.68) 0%, rgba(4,10,20,0.45) 40%, rgba(4,10,20,0.80) 100%)',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
            background: 'linear-gradient(to top, rgba(2,6,9,0.88) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/logo-azul.png" alt="Logo VPN" width={42} height={42} style={{ borderRadius: 9, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.94)', letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1.3 }}>
                Casa Apostólica
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.98)', lineHeight: 1.2 }}>
                Voz para as Nações
              </div>
            </div>
          </div>

          {/* Headline */}
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

            {success ? (
              /* Estado de sucesso */
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 600, color: '#0F0E0C', margin: '0 0 8px' }}>
                  Conta criada!
                </h2>
                <p style={{ fontSize: 13, color: '#949390', margin: '0 0 28px', lineHeight: 1.6 }}>
                  Verifique seu e-mail para confirmar o acesso antes de entrar.
                </p>
                <Link href="/login" className="login-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', height: 46, borderRadius: 8 }}>
                  Ir para o login
                </Link>
              </div>
            ) : (
              <>
                {/* Heading */}
                <div style={{ marginBottom: 28 }}>
                  <h1 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 26, fontWeight: 500,
                    color: '#0F0E0C', margin: '0 0 6px',
                    letterSpacing: '-0.01em', lineHeight: 1.2,
                  }}>
                    Criar conta
                  </h1>
                  <p style={{ fontSize: 13, color: '#949390', margin: 0, fontWeight: 500 }}>
                    Preencha os dados para se cadastrar.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Nome */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 400, color: '#1C3568', marginBottom: 6 }}>
                      Nome
                    </label>
                    <input
                      className="login-input"
                      type="text"
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      required
                      autoComplete="name"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  {/* E-mail */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 400, color: '#1C3568', marginBottom: 6 }}>
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
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 400, color: '#1C3568', marginBottom: 6 }}>
                      Senha
                    </label>
                    <input
                      className="login-input"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  {/* Erro */}
                  {error && (
                    <div style={{ marginBottom: 18, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? 'Criando conta…' : 'Criar conta'}
                  </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 13, color: '#949390', margin: '22px 0 0' }}>
                  Já tem conta?{' '}
                  <Link href="/login" className="login-link">
                    Entrar
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
