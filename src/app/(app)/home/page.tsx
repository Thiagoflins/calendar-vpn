'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardWeekCalendar } from '@/components/dashboard/DashboardWeekCalendar';
import { EventDetailModal } from '@/components/calendar/EventDetailModal';
import { useEvents, useRemoveEvent } from '@/hooks/useEvents';
import { usePeople } from '@/hooks/usePeople';
import { useTeams } from '@/hooks/useTeams';
import { getColor } from '@/lib/colors';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

function fd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function weekStart(d: Date) {
  const r = new Date(d); let dw = r.getDay(); dw = dw === 0 ? 6 : dw - 1; r.setDate(r.getDate() - dw); return r;
}
function weekEnd(d: Date) {
  const r = weekStart(d); r.setDate(r.getDate() + 6); return r;
}

export default function HomePage() {
  const router = useRouter();
  const today = new Date(2026, 5, 15);
  const todayStr = fd(today);

  const { data: events = [] } = useEvents();
  const { data: people = [] } = usePeople();
  const { data: teams = [] } = useTeams();
  const deleteEvent = useRemoveEvent();

  const [weekDate, setWeekDate] = useState(today);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) ?? null : null;

  const upcoming = events
    .filter(e => e.data >= todayStr)
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .slice(0, 10);

  const thisMonth = events.filter(e => { const [y, m] = e.data.split('-').map(Number); return y === 2026 && m === 6; }).length;
  const activeCount = people.filter(p => p.ativo).length;
  const thisWeek = events.filter(e => {
    const ws = fd(weekStart(today)), we = fd(weekEnd(today));
    return e.data >= ws && e.data <= we;
  }).length;

  const ws = weekStart(weekDate);
  const we = weekEnd(weekDate);
  const wsMonth = ws.getMonth(), weMonth = we.getMonth();
  const weekLabel = wsMonth === weMonth
    ? `${ws.getDate()} – ${we.getDate()} de ${MONTHS[wsMonth]}, ${ws.getFullYear()}`
    : `${ws.getDate()} ${MONTHS[wsMonth].slice(0,3)} – ${we.getDate()} ${MONTHS[weMonth].slice(0,3)} ${ws.getFullYear()}`;

  const navWeek = (dir: number) => {
    const d = new Date(weekDate); d.setDate(d.getDate() + dir * 7); setWeekDate(d);
  };

  return (
    <AppShell onAddEvent={() => router.push('/calendario')}>
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden', gap: 0 }}>

        {/* ── Calendário semanal (área principal) ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px 0 16px 20px' }}>
          <div style={{ background: '#fff', borderRadius: 6, border: '1px solid #EEF0F4', boxShadow: '0 1px 3px rgba(16,24,40,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>

            {/* Header */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#101828' }}>{weekLabel}</div>
              </div>
              <button
                onClick={() => setWeekDate(today)}
                style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 12, cursor: 'pointer' }}
              >Hoje</button>
              <div style={{ display: 'flex', gap: 2 }}>
                <button onClick={() => navWeek(-1)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                <button onClick={() => navWeek(1)}  style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
              </div>
              <button
                onClick={() => router.push('/calendario')}
                style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: '#2E5AAC', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
              >Ver calendário</button>
            </div>

            <DashboardWeekCalendar
              date={weekDate}
              events={events}
              onEventClick={id => setSelectedEventId(id)}
              onDayClick={ds => router.push(`/calendario?date=${ds}&view=dia`)}
            />
          </div>
        </div>

        {/* ── Painel lateral ── */}
        <div style={{ width: 288, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 20px 16px 12px', overflow: 'hidden' }}>

          {/* Acesso rápido */}
          <div style={{ background: '#fff', borderRadius: 6, border: '1px solid #EEF0F4', boxShadow: '0 1px 3px rgba(16,24,40,0.04)', padding: '12px 14px', flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 9 }}>Acesso rápido</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {[
                { icon: '➕', lbl: 'Novo Evento', fn: () => router.push('/calendario'), color: '#2E5AAC', bg: '#EBF2FC' },
                { icon: '👥', lbl: 'Membros', fn: () => router.push('/pessoas'), color: '#1D9E75', bg: '#E3F7F0' },
                { icon: '🗂️', lbl: 'Equipes', fn: () => router.push('/organizacao'), color: '#7F77DD', bg: '#EEEDFE' },
                { icon: '📅', lbl: 'Calendário', fn: () => router.push('/calendario'), color: '#BA7517', bg: '#FAEEDA' },
              ].map(a => (
                <button
                  key={a.lbl}
                  onClick={a.fn}
                  style={{ padding: '9px 6px', borderRadius: 6, border: 'none', background: a.bg, color: a.color, cursor: 'pointer', fontSize: 11, fontWeight: 400, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'filter 0.12s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(0.95)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.filter = ''}
                >
                  <span style={{ fontSize: 17 }}>{a.icon}</span>
                  <span>{a.lbl}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Próximos eventos */}
          <div style={{ background: '#fff', borderRadius: 6, border: '1px solid #EEF0F4', boxShadow: '0 1px 3px rgba(16,24,40,0.04)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #F0F2F5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#101828' }}>Próximos eventos</span>
              <span style={{ fontSize: 11, color: '#C4CAD4' }}>{upcoming.length}</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {upcoming.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: '#9AA3B5', fontSize: 13 }}>Sem eventos</div>
              )}
              {upcoming.map((ev, i) => {
                const cl = getColor(ev.cor);
                const evDate = new Date(ev.data + 'T12:00:00');
                const isToday = ev.data === todayStr;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    style={{ display: 'flex', gap: 10, padding: '8px 14px', cursor: 'pointer', borderBottom: i < upcoming.length - 1 ? '1px solid #F7F8FA' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFBFD'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                  >
                    {/* Date */}
                    <div style={{ width: 34, flexShrink: 0, textAlign: 'center', paddingTop: 1 }}>
                      <div style={{ fontSize: 9, fontWeight: 500, color: isToday ? '#2E5AAC' : '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {isToday ? 'HOJE' : DAYS_PT[evDate.getDay()].toUpperCase()}
                      </div>
                      <div style={{ fontSize: 17, fontWeight: isToday ? 600 : 400, color: isToday ? '#2E5AAC' : '#374151', lineHeight: 1.2 }}>{evDate.getDate()}</div>
                    </div>
                    {/* Bar */}
                    <div style={{ width: 3, borderRadius: 4, background: cl.dot, flexShrink: 0, alignSelf: 'stretch', margin: '2px 0' }} />
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.nome}</div>
                      <div style={{ fontSize: 11, color: '#9AA3B5', marginTop: 1 }}>{ev.hora}{ev.pastor ? ` · ${ev.pastor.split(' ').slice(-1)[0]}` : ''}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats — compacto */}
          <div style={{ background: '#fff', borderRadius: 6, border: '1px solid #EEF0F4', boxShadow: '0 1px 3px rgba(16,24,40,0.04)', padding: '12px 14px', flexShrink: 0 }}>
            {[
              { label: 'Esta semana', val: thisWeek, color: '#2E5AAC', bg: '#EBF2FC' },
              { label: 'Eventos em junho', val: thisMonth, color: '#1D9E75', bg: '#E3F7F0' },
              { label: 'Membros ativos', val: activeCount, color: '#7F77DD', bg: '#EEEDFE' },
              { label: 'Equipes', val: teams.length, color: '#BA7517', bg: '#FAEEDA' },
            ].map((s, i, arr) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < arr.length - 1 ? '1px solid #F5F6F8' : 'none' }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>{s.label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: s.color, background: s.bg, padding: '2px 10px', borderRadius: 4 }}>{s.val}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEventId(null)}
          onEdit={() => { setSelectedEventId(null); router.push('/calendario'); }}
          onDelete={async () => { if (selectedEvent) await deleteEvent.mutateAsync(selectedEvent.id); setSelectedEventId(null); }}
        />
      )}
    </AppShell>
  );
}
