'use client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useEvents } from '@/hooks/useEvents';
import { usePeople } from '@/hooks/usePeople';
import { useTeams } from '@/hooks/useTeams';
import { getColor } from '@/lib/colors';

function fd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmtDatePT(ds: string) {
  if (!ds) return '';
  const [y, mo, d] = ds.split('-');
  return `${d}/${mo}/${y}`;
}

export default function HomePage() {
  const router = useRouter();
  const today = fd(new Date(2026, 5, 15));
  const { data: events = [] } = useEvents();
  const { data: people = [] } = usePeople();
  const { data: teams = [] } = useTeams();

  const upcoming = events
    .filter(e => e.data >= today)
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .slice(0, 5);

  const thisMonth = events.filter(e => { const [y, m] = e.data.split('-').map(Number); return y === 2026 && m === 6; }).length;
  const activeCount = people.filter(p => p.ativo).length;

  return (
    <AppShell onAddEvent={() => router.push('/calendario')}>
      <div style={{ padding: 28 }}>
        {/* Greeting */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#101828', margin: '0 0 4px' }}>Olá, Pr. Roberto! 👋</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Bem-vindo ao Sistema de Gestão VPN.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { icon: '📅', label: 'Eventos em Jun', val: thisMonth, color: '#2E5AAC', bg: '#E6F1FB' },
            { icon: '👥', label: 'Membros ativos', val: activeCount, color: '#1D9E75', bg: '#E1F5EE' },
            { icon: '🗂️', label: 'Equipes', val: teams.length, color: '#534AB7', bg: '#EEEDFE' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
              </div>
              <div style={{ fontSize: 34, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming events */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(16,24,40,0.04)', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#101828', marginBottom: 14 }}>Próximos Eventos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcoming.map(ev => {
              const cl = getColor(ev.cor);
              const icon = ev.type === 'culto' ? '⛪' : '📅';
              const lbl = ev.type === 'culto' ? 'Culto' : 'Atividade';
              return (
                <div
                  key={ev.id}
                  onClick={() => router.push('/calendario')}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, background: cl.bg, cursor: 'pointer', transition: 'opacity 0.15s' }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: cl.dot, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: cl.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.nome}</div>
                    <div style={{ fontSize: 12, color: cl.text, opacity: 0.75 }}>{fmtDatePT(ev.data)} · {ev.hora}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: cl.text, background: cl.bg, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap', border: `1px solid ${cl.dot}33` }}>{lbl}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: '➕', lbl: 'Novo Evento', fn: () => router.push('/calendario') },
            { icon: '📅', lbl: 'Calendário', fn: () => router.push('/calendario') },
            { icon: '👥', lbl: 'Membros', fn: () => router.push('/pessoas') },
          ].map(a => (
            <button
              key={a.lbl}
              onClick={a.fn}
              style={{ padding: 16, borderRadius: 14, border: '2px dashed #BBD3F0', background: '#F0F7FE', color: '#2E5AAC', cursor: 'pointer', fontSize: 13, fontWeight: 600, textAlign: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2E5AAC'; (e.currentTarget as HTMLButtonElement).style.background = '#E6F1FB'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#BBD3F0'; (e.currentTarget as HTMLButtonElement).style.background = '#F0F7FE'; }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{a.icon}</div>
              {a.lbl}
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
