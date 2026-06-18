'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardWeekCalendar } from '@/components/dashboard/DashboardWeekCalendar';
import { EventDetailModal } from '@/components/calendar/EventDetailModal';
import { useEvents, useRemoveEvent } from '@/hooks/useEvents';
import { useIsMobile } from '@/hooks/useIsMobile';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
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

const TYPE_COLOR: Record<string, string> = { culto: '#2E5AAC', atividade: '#059669' };

export default function HomePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const today = new Date();
  const todayStr = fd(today);

  const { data: events = [] } = useEvents();
  const deleteEvent = useRemoveEvent();

  const [weekDate, setWeekDate] = useState(today);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) ?? null : null;

  const ws = weekStart(weekDate);
  const we = weekEnd(weekDate);
  const wsMonth = ws.getMonth(), weMonth = we.getMonth();
  const weekLabel = wsMonth === weMonth
    ? `${ws.getDate()} – ${we.getDate()} de ${MONTHS[wsMonth]}, ${ws.getFullYear()}`
    : `${ws.getDate()} ${MONTHS[wsMonth].slice(0,3)} – ${we.getDate()} ${MONTHS[weMonth].slice(0,3)} ${ws.getFullYear()}`;

  const navWeek = (dir: number) => {
    const d = new Date(weekDate); d.setDate(d.getDate() + dir * 7); setWeekDate(d);
  };

  const todayEvents = events.filter(e => e.data === todayStr)
    .sort((a, b) => (a.hora ?? '').localeCompare(b.hora ?? ''));

  const nextEvents = events
    .filter(e => e.data > todayStr)
    .sort((a, b) => a.data.localeCompare(b.data) || (a.hora ?? '').localeCompare(b.hora ?? ''))
    .slice(0, 6);

  if (isMobile) {
    return (
      <AppShell onAddEvent={() => router.push('/calendario')}>
        <div style={{ padding: '20px 14px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Data de hoje */}
          <div>
            <div style={{ fontSize: 13, color: '#9AA3B5' }}>
              {DAYS_PT[today.getDay()]}, {today.getDate()} de {MONTHS[today.getMonth()]} {today.getFullYear()}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#101828', marginTop: 3, letterSpacing: '-0.02em' }}>
              {todayEvents.length > 0
                ? `${todayEvents.length} evento${todayEvents.length > 1 ? 's' : ''} hoje`
                : 'Nenhum evento hoje'}
            </div>
          </div>

          {/* Eventos de hoje */}
          {todayEvents.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hoje</span>
              </div>
              {todayEvents.map((ev, i) => (
                <div key={ev.id} onClick={() => setSelectedEventId(ev.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < todayEvents.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer' }}>
                  <div style={{ width: 3, height: 38, borderRadius: 2, background: TYPE_COLOR[ev.tipo] ?? '#6B7280', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.nome}</div>
                    {ev.hora && <div style={{ fontSize: 12, color: '#9AA3B5', marginTop: 2 }}>{ev.hora}</div>}
                  </div>
                  <span style={{ fontSize: 11, color: TYPE_COLOR[ev.tipo], background: `${TYPE_COLOR[ev.tipo]}18`, padding: '3px 9px', borderRadius: 6, fontWeight: 500, flexShrink: 0 }}>
                    {ev.tipo === 'culto' ? 'Culto' : 'Atividade'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Próximos eventos */}
          {nextEvents.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Próximos eventos</span>
              </div>
              {nextEvents.map((ev, i) => {
                const d = new Date(ev.data + 'T12:00:00');
                return (
                  <div key={ev.id} onClick={() => setSelectedEventId(ev.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < nextEvents.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: '#F0F4FB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#2E5AAC', lineHeight: 1 }}>{d.getDate()}</span>
                      <span style={{ fontSize: 9, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 1 }}>{MONTHS_SHORT[d.getMonth()]}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.nome}</div>
                      <div style={{ fontSize: 12, color: '#9AA3B5', marginTop: 2 }}>
                        {DAYS_PT[d.getDay()]}{ev.hora ? ` · ${ev.hora}` : ''}
                      </div>
                    </div>
                    <div style={{ width: 3, height: 28, borderRadius: 2, background: TYPE_COLOR[ev.tipo] ?? '#6B7280', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          )}

          {todayEvents.length === 0 && nextEvents.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#F0F4FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M8 2V5M16 2V5M3 8H21M5 4H19C20.105 4 21 4.895 21 6V19C21 20.105 20.105 21 19 21H5C3.895 21 3 20.105 3 19V6C3 4.895 3.895 4 5 4Z" stroke="#9AA3B5" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#374151' }}>Sem eventos próximos</div>
              <div style={{ fontSize: 13, color: '#9AA3B5', marginTop: 4 }}>Adicione eventos pelo calendário</div>
            </div>
          )}

          <button onClick={() => router.push('/calendario')}
            style={{ width: '100%', padding: '13px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', color: '#2E5AAC', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
            Ver todos os eventos →
          </button>
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

  return (
    <AppShell onAddEvent={() => router.push('/calendario')}>
      <div style={{ height: '100%', overflow: 'hidden', padding: '16px 20px' }}>
        <div style={{ background: '#fff', borderRadius: 6, border: '1px solid #EEF0F4', boxShadow: '0 1px 3px rgba(16,24,40,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>

          <div style={{ padding: '14px 18px', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#101828' }}>{weekLabel}</div>
            </div>
            <button onClick={() => setWeekDate(today)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 12, cursor: 'pointer' }}>Hoje</button>
            <div style={{ display: 'flex', gap: 2 }}>
              <button onClick={() => navWeek(-1)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
              <button onClick={() => navWeek(1)}  style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            </div>
            <button onClick={() => router.push('/calendario')} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: '#2E5AAC', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>Ver calendário</button>
          </div>

          <DashboardWeekCalendar
            date={weekDate}
            events={events}
            onEventClick={id => setSelectedEventId(id)}
            onDayClick={ds => router.push(`/calendario?date=${ds}&view=dia`)}
          />
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
