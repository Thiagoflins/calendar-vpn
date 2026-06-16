'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { authService } from '@/services/authService';
import { AuthUser } from '@/types';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function fd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function initials(nome?: string, email?: string) {
  const src = nome || email || '?';
  return src.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

type HeaderProps = {
  onAddEvent?: () => void;
  onAddPerson?: () => void;
  onAddTeam?: () => void;
};

export function Header({ onAddEvent, onAddPerson, onAddTeam }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const page = pathname.split('/')[1] ?? 'home';

  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    authService.getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const viewParam = params.get('view') ?? 'mes';
  const dateParam = params.get('date');
  const currentDate = dateParam ? new Date(dateParam + 'T12:00:00') : new Date(2026, 5, 15);

  const periodLabel = () => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    if (viewParam === 'mes') return `${MONTHS[m]}, ${y}`;
    if (viewParam === 'semana') {
      const ws = weekStart(currentDate);
      const we = new Date(ws); we.setDate(ws.getDate() + 6);
      if (ws.getMonth() === we.getMonth()) return `${ws.getDate()}–${we.getDate()} de ${MONTHS[m]} ${y}`;
      return `${ws.getDate()} ${MONTHS[ws.getMonth()].slice(0,3)} – ${we.getDate()} ${MONTHS[we.getMonth()].slice(0,3)} ${y}`;
    }
    return `${currentDate.getDate()} de ${MONTHS[m]} ${y}`;
  };

  function weekStart(d: Date) {
    const r = new Date(d); let dw = r.getDay(); dw = dw === 0 ? 6 : dw - 1; r.setDate(r.getDate() - dw); return r;
  }

  const titles: Record<string, string> = {
    home: 'Home',
    calendario: periodLabel(),
    pessoas: 'Pessoas',
    organizacao: 'Organização',
    louvor: 'Louvor',
    relatorios: 'Relatórios',
    conta: 'Minha Conta',
  };

  const setParam = (key: string, val: string) => {
    const p = new URLSearchParams(params.toString());
    p.set(key, val);
    router.push(`/${page}?${p.toString()}`);
  };

  const navDate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewParam === 'mes') d.setMonth(d.getMonth() + dir);
    else if (viewParam === 'semana') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setParam('date', fd(d));
  };

  const viewBtn = (v: string, lbl: string) => (
    <button
      key={v}
      onClick={() => setParam('view', v)}
      style={{
        padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: viewParam === v ? 500 : 400,
        background: viewParam === v ? '#fff' : 'transparent',
        color: viewParam === v ? '#101828' : '#6B7280',
        boxShadow: viewParam === v ? '0 1px 3px rgba(16,24,40,0.10)' : 'none',
        transition: 'all 0.15s',
      }}
    >{lbl}</button>
  );

  async function handleSignOut() {
    await authService.signOut();
    router.push('/login');
  }

  return (
    <header style={{
      background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 20px 0 24px',
      height: 60, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
    }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#101828', letterSpacing: '-0.01em', flexShrink: 0, whiteSpace: 'nowrap' }}>
        {titles[page] ?? page}
      </div>
      <div style={{ flex: 1 }} />

      {page === 'calendario' && (
        <div style={{ display: 'flex', background: '#EEF1F6', borderRadius: 6, padding: 3, gap: 1 }}>
          {viewBtn('mes', 'Mês')}{viewBtn('semana', 'Semana')}{viewBtn('dia', 'Dia')}
        </div>
      )}

      {page === 'calendario' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => navDate(-1)} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#374151', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <button onClick={() => setParam('date', fd(new Date(2026, 5, 15)))} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#374151', fontSize: 13, fontWeight: 400 }}>Hoje</button>
          <button onClick={() => navDate(1)} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#374151', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>
      )}

      {page === 'calendario' && (
        <button onClick={onAddEvent} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 6, border: 'none', background: '#2E5AAC', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Adicionar
        </button>
      )}


      {/* User dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative', marginLeft: 8 }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 8, border: '1px solid #E5E7EB', background: open ? '#F3F4F6' : '#fff', cursor: 'pointer', transition: 'background 0.15s' }}
        >
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#2E5AAC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {initials(user?.nome, user?.email)}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{user?.nome || user?.email || '—'}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: '#9CA3AF', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: 180, background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(16,24,40,0.10)', zIndex: 100, overflow: 'hidden' }}>
            <button
              onClick={() => { setOpen(false); router.push('/conta'); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: '#374151', textAlign: 'left' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              👤 Minha conta
            </button>
            <div style={{ height: 1, background: '#F3F4F6' }} />
            <button
              onClick={handleSignOut}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: '#EF4444', textAlign: 'left' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              🚪 Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
