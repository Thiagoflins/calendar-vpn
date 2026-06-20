'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { MONTHS, fd } from '@/lib/dateUtils';

const DAY_INITIALS = ['S','T','Q','Q','S','S','D'];

const COR_MAP: Record<string, string> = {
  azul: '#2E5AAC', verde: '#1D9E75', rosa: '#E4608E',
  roxo: '#7F77DD', laranja: '#E87A2D', amarelo: '#BA7517',
};

function fmtShort(ds: string) {
  const [, mo, d] = ds.split('-');
  return `${d}/${mo}`;
}

function fmtWeekday(ds: string) {
  const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const [y, mo, d] = ds.split('-').map(Number);
  return days[new Date(y, mo - 1, d).getDay()];
}

type Props = {
  onAddEvent?: () => void;
};

export function RightSidebar({ onAddEvent }: Props) {
  const router = useRouter();
  const today = new Date();
  const todayStr = fd(today);
  const [miniDate, setMiniDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const { data: events = [] } = useEvents();

  const y = miniDate.getFullYear(), m = miniDate.getMonth();

  const miniCells = useMemo(() => {
    const first = new Date(y, m, 1);
    let dow = first.getDay(); dow = dow === 0 ? 6 : dow - 1;
    const start = new Date(y, m, 1 - dow);
    return Array.from({ length: 35 }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const ds = fd(d), inM = d.getMonth() === m, isT = ds === todayStr;
      const hasEv = events.some(e => e.data === ds);
      return { day: d.getDate(), ds, inM, isT, hasEv };
    });
  }, [y, m, todayStr, events]);

  const upcoming = useMemo(() =>
    events
      .filter(e => e.data >= todayStr)
      .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
      .slice(0, 4),
  [events, todayStr]);

  const QUICK = [
    {
      label: 'Novo evento',
      icon: (
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
          <path d="M8 2V5M16 2V5M3 8H21M5 4H19C20.105 4 21 4.895 21 6V19C21 20.105 20.105 21 19 21H5C3.895 21 3 20.105 3 19V6C3 4.895 3.895 4 5 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 11V17M9 14H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      action: () => onAddEvent?.(),
      color: '#2E5AAC',
    },
    {
      label: 'Calendário',
      icon: (
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
          <path d="M8 2V5M16 2V5M3 8H21M5 4H19C20.105 4 21 4.895 21 6V19C21 20.105 20.105 21 19 21H5C3.895 21 3 20.105 3 19V6C3 4.895 3.895 4 5 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      action: () => router.push('/calendario'),
      color: '#1D9E75',
    },
    {
      label: 'Pessoas',
      icon: (
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
          <path d="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M23 21V19C22.999 17.153 21.765 15.537 20 15.09M16 3.13C17.769 3.579 19.006 5.198 19.006 7.05C19.006 8.902 17.769 10.521 16 10.97M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      action: () => router.push('/pessoas'),
      color: '#7F77DD',
    },
    {
      label: 'Organização',
      icon: (
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
          <path d="M3 9L12 2L21 9V20C21 20.552 20.552 21 20 21H15V16H9V21H4C3.448 21 3 20.552 3 20V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      action: () => router.push('/organizacao'),
      color: '#E87A2D',
    },
  ];

  return (
    <aside style={{
      width: 248, background: '#fff', borderLeft: '1px solid #E5E7EB',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      overflow: 'hidden', height: '100vh',
    }}>

      {/* Mini Calendar */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid #F0F2F5', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#101828' }}>
            {MONTHS[m]} {y}
          </span>
          <div style={{ display: 'flex', gap: 2 }}>
            <button
              onClick={() => setMiniDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}
              style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.13s, border-color 0.13s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#F5F7FA'; el.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#fff'; el.style.borderColor = '#E5E7EB'; }}
            >‹</button>
            <button
              onClick={() => setMiniDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}
              style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.13s, border-color 0.13s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#F5F7FA'; el.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#fff'; el.style.borderColor = '#E5E7EB'; }}
            >›</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {DAY_INITIALS.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#9AA3B5', paddingBottom: 2 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px 0' }}>
          {miniCells.map(cell => (
            <div
              key={cell.ds}
              onClick={() => router.push(`/calendario?date=${cell.ds}&view=dia`)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, cursor: 'pointer' }}
            >
              <span style={{
                fontSize: 11, fontWeight: cell.isT ? 700 : cell.inM ? 400 : 300,
                color: cell.isT ? '#fff' : cell.inM ? '#374151' : '#C4C9D4',
                background: cell.isT ? '#2E5AAC' : 'transparent',
                width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', position: 'relative', transition: 'background 0.1s',
              }}
                onMouseEnter={e => { if (!cell.isT) (e.currentTarget as HTMLSpanElement).style.background = '#F0F4FF'; }}
                onMouseLeave={e => { if (!cell.isT) (e.currentTarget as HTMLSpanElement).style.background = 'transparent'; }}
              >
                {cell.day}
                {cell.hasEv && !cell.isT && (
                  <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: '#2E5AAC' }} />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Próximos Eventos */}
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #F0F2F5', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Próximos eventos</span>
          <button
            onClick={() => router.push('/calendario')}
            style={{ fontSize: 11, color: '#2E5AAC', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0, transition: 'opacity 0.13s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.65'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >Ver todos</button>
        </div>
        {upcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '12px 0', color: '#9AA3B5', fontSize: 12 }}>Nenhum evento próximo</div>
        ) : upcoming.map(ev => (
          <div
            key={ev.id}
            onClick={() => router.push(`/calendario?date=${ev.data}&view=dia`)}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 6px', margin: '0 -6px', borderBottom: '1px solid #F5F5F5', cursor: 'pointer', borderRadius: 7, transition: 'background 0.13s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F5F7FC'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            <div style={{ textAlign: 'center', minWidth: 36, flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#9AA3B5', textTransform: 'uppercase', lineHeight: 1 }}>{fmtWeekday(ev.data)}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#101828', lineHeight: 1.1 }}>{ev.data.split('-')[2]}</div>
              <div style={{ fontSize: 9, color: '#9AA3B5', lineHeight: 1 }}>{fmtShort(ev.data).split('/')[1] === todayStr.split('-')[1] ? '' : fmtShort(ev.data)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: COR_MAP[ev.cor] ?? '#2E5AAC', display: 'inline-block', marginRight: 5, verticalAlign: 'middle' }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#101828' }}>{ev.nome}</span>
              <div style={{ fontSize: 11, color: '#9AA3B5', marginTop: 1 }}>{ev.hora.slice(0, 5)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Acesso Rápido */}
      <div style={{ padding: '14px 14px 12px', flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Acesso rápido</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {QUICK.map(q => (
            <button
              key={q.label}
              onClick={q.action}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: 6, padding: '10px 10px', borderRadius: 10,
                border: '1px solid #E5E7EB', background: '#FAFBFC',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F0F4FF'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#C7D7F5'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FAFBFC'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; }}
            >
              <span style={{ color: q.color }}>{q.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#374151', lineHeight: 1.2 }}>{q.label}</span>
            </button>
          ))}
        </div>
      </div>

    </aside>
  );
}
