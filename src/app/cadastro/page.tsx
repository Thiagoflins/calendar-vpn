'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { authService } from '@/services/authService';

export default function CadastroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <div style={{ minHeight: '100vh', background: '#131822', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image src="/logo-azul.png" alt="Logo VPN" width={72} height={72} style={{ borderRadius: 12, margin: '0 auto 16px' }} />
          <div style={{ fontSize: 12, fontWeight: 400, color: '#9AA3B5', marginBottom: 4 }}>Casa Apostólica</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#E7EAF0' }}>Voz para as Nações</div>
        </div>

        {success ? (
          <div style={{ background: '#1B2230', borderRadius: 12, padding: 28, border: '1px solid #2F3848', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>✉️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#E7EAF0', marginBottom: 8 }}>Conta criada!</div>
            <div style={{ fontSize: 13, color: '#9AA3B5', marginBottom: 24 }}>
              Verifique seu e-mail para confirmar o acesso antes de entrar.
            </div>
            <Link
              href="/login"
              style={{ display: 'block', padding: '11px', background: '#2E5AAC', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
            >
              Ir para o login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} style={{ background: '#1B2230', borderRadius: 12, padding: 28, border: '1px solid #2F3848' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#9AA3B5', marginBottom: 6 }}>Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                  autoComplete="name"
                  style={{ width: '100%', background: '#242C3D', border: '1px solid #2F3848', borderRadius: 8, padding: '10px 12px', color: '#E7EAF0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Seu nome completo"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#9AA3B5', marginBottom: 6 }}>E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{ width: '100%', background: '#242C3D', border: '1px solid #2F3848', borderRadius: 8, padding: '10px 12px', color: '#E7EAF0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  placeholder="seu@email.com"
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#9AA3B5', marginBottom: 6 }}>Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  style={{ width: '100%', background: '#242C3D', border: '1px solid #2F3848', borderRadius: 8, padding: '10px 12px', color: '#E7EAF0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              {error && (
                <div style={{ marginBottom: 16, padding: '10px 12px', background: '#3D1515', border: '1px solid #5C2020', borderRadius: 8, fontSize: 13, color: '#F87171' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '11px', background: loading ? '#1E3A6E' : '#2E5AAC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9AA3B5' }}>
              Já tem conta?{' '}
              <Link href="/login" style={{ color: '#4A7BC8', fontWeight: 500, textDecoration: 'none' }}>
                Entrar
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
