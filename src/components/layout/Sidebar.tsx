'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { useEvents } from '@/hooks/useEvents';
import { usePeople } from '@/hooks/usePeople';
import { useTeams } from '@/hooks/useTeams';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAY_INITIALS = ['S','T','Q','Q','S','S','D'];

function fd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function fmtDatePT(ds: string) {
  if (!ds) return '';
  const [y, mo, d] = ds.split('-');
  return `${d}/${mo}/${y}`;
}

const NAV_ITEMS = [
  { id: 'home',        icon: '🏠', label: 'Home',        path: '/home' },
  { id: 'calendario',  icon: '📅', label: 'Calendário',  path: '/calendario' },
  { id: 'pessoas',     icon: '👥', label: 'Pessoas',      path: '/pessoas' },
  { id: 'organizacao', icon: '🗂️', label: 'Organização', path: '/organizacao' },
  { id: 'louvor',      icon: '🎵', label: 'Louvor',       path: '/louvor',     soon: true },
  { id: 'relatorios',  icon: '📊', label: 'Relatórios',  path: '/relatorios', soon: true },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const today = new Date(2026, 5, 15);
  const todayStr = fd(today);
  const [miniDate, setMiniDate] = useState(new Date(2026, 5, 1));
  const { data: events = [] } = useEvents();
  const { data: people = [] } = usePeople();
  const { data: teams = [] } = useTeams();

  const y = miniDate.getFullYear(), m = miniDate.getMonth();
  const first = new Date(y, m, 1);
  let dow = first.getDay(); dow = dow === 0 ? 6 : dow - 1;
  const start = new Date(y, m, 1 - dow);
  const miniCells = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const ds = fd(d), inM = d.getMonth() === m, isT = ds === todayStr;
    const hasEv = events.some(e => e.data === ds);
    return { day: d.getDate(), ds, inM, isT, hasEv };
  });

  const wsStart = (() => { const r = new Date(today); let dw = r.getDay(); dw = dw === 0 ? 6 : dw - 1; r.setDate(r.getDate() - dw); return fd(r); })();
  const wsEnd = (() => { const r = new Date(today); let dw = r.getDay(); dw = dw === 0 ? 6 : dw - 1; r.setDate(r.getDate() - dw + 6); return fd(r); })();
  const thisWeek = events.filter(e => e.data >= wsStart && e.data <= wsEnd).length;
  const thisMonth = events.filter(e => { const [y, m] = e.data.split('-').map(Number); return y === today.getFullYear() && m === today.getMonth() + 1; }).length;
  const activeCount = people.filter(p => p.ativo).length;

  const nextEv = events.filter(e => e.data >= todayStr).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))[0] ?? null;
  const activePath = '/' + pathname.split('/')[1];

  return (
    <aside style={{
      width: 260, background: '#1B2230', display: 'flex', flexDirection: 'column',
      flexShrink: 0, overflow: 'hidden', height: '100vh',
    }}>

      {/* Logo */}
      <div
        onClick={() => router.push('/home')}
        style={{ padding: '12px 16px', borderBottom: '1px solid #2F3848', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}
      >
        <Image src="/logo-azul.png" alt="Logo VPN" width={44} height={44} style={{ borderRadius: 8, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 400, color: '#9AA3B5', lineHeight: 1.2 }}>Casa Apostólica</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#E7EAF0', lineHeight: 1.2 }}>Voz para as Nações</div>
        </div>
      </div>

      {/* Mini calendar */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #2F3848', flexShrink: 0 }}>
        <div style={{ background: '#242C3D', borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <button
              onClick={() => setMiniDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}
              style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: 'transparent', color: '#9AA3B5', cursor: 'pointer', fontSize: 15, lineHeight: 1 }}
            >‹</button>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#E7EAF0' }}>{MONTHS[m].slice(0, 3)} {y}</span>
            <button
              onClick={() => setMiniDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}
              style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: 'transparent', color: '#9AA3B5', cursor: 'pointer', fontSize: 15, lineHeight: 1 }}
            >›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 2 }}>
            {DAY_INITIALS.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 500, color: '#4B5563' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {miniCells.map(cell => (
              <div
                key={cell.ds}
                onClick={() => router.push(`/calendario?date=${cell.ds}&view=dia`)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 19, cursor: 'pointer' }}
              >
                <span style={{
                  fontSize: 9, fontWeight: cell.isT ? 700 : 400,
                  color: cell.isT ? '#fff' : cell.inM ? '#C8CDD9' : '#3D4455',
                  background: cell.isT ? '#2E5AAC' : 'transparent',
                  width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', position: 'relative',
                }}>
                  {cell.day}
                  {cell.hasEv && !cell.isT && (
                    <span style={{ position: 'absolute', bottom: 1, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: '#4A7BC8' }} />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next event */}
      {nextEv && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #2F3848', flexShrink: 0 }}>
          <div style={{ background: '#242C3D', borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Próximo evento</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#E7EAF0', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nextEv.nome}</div>
            <div style={{ fontSize: 10, color: '#9AA3B5' }}>{fmtDatePT(nextEv.data)} · {nextEv.hora.slice(0, 5)}</div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ padding: '8px', flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 3 }}>Menu</div>
        {NAV_ITEMS.map(item => item.soon ? (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 5, color: '#3D4455', fontSize: 13, marginBottom: 1, cursor: 'default' }}>
            <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
            <span>{item.label}</span>
            <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, background: '#1E293B', color: '#6B7280', padding: '1px 6px', borderRadius: 4 }}>em breve</span>
          </div>
        ) : (
          <button
            key={item.id}
            onClick={() => router.push(item.path)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
              borderRadius: 5, border: 'none', cursor: 'pointer',
              background: activePath === item.path ? '#2E5AAC' : 'transparent',
              color: activePath === item.path ? '#fff' : '#9AA3B5',
              fontSize: 13, fontWeight: activePath === item.path ? 500 : 400,
              textAlign: 'left', marginBottom: 1, transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Stats */}
      <div style={{ padding: '10px 14px 12px', borderTop: '1px solid #2F3848', flexShrink: 0 }}>
        {[
          { label: 'Esta semana',     val: thisWeek,    color: '#4A7BC8', bg: '#1E2E47' },
          { label: 'Eventos no mês',  val: thisMonth,   color: '#1D9E75', bg: '#13312A' },
          { label: 'Membros ativos',  val: activeCount, color: '#7F77DD', bg: '#252048' },
          { label: 'Equipes',         val: teams.length,color: '#BA7517', bg: '#312409' },
        ].map((s, i, arr) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < arr.length - 1 ? '1px solid #2A3347' : 'none' }}>
            <span style={{ fontSize: 11, color: '#9AA3B5' }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: s.color, background: s.bg, padding: '1px 8px', borderRadius: 4, minWidth: 24, textAlign: 'center' }}>{s.val}</span>
          </div>
        ))}
      </div>

    </aside>
  );
}
