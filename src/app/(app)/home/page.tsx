'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardWeekCalendar } from '@/components/dashboard/DashboardWeekCalendar';
import { EventDetailModal } from '@/components/calendar/EventDetailModal';
import { useEvents, useRemoveEvent } from '@/hooks/useEvents';
import { useIsMobile } from '@/hooks/useIsMobile';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAY_LABELS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
const DAYS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

const COR_MAP: Record<string, string> = {
  azul: '#2E5AAC', verde: '#1D9E75', rosa: '#E4608E',
  roxo: '#7F77DD', laranja: '#E87A2D', amarelo: '#BA7517',
};

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
  const isMobile = useIsMobile();
  const today = new Date();
  const todayStr = fd(today);

  const { data: events = [] } = useEvents();
  const deleteEvent = useRemoveEvent();

  // Desktop
  const [weekDate, setWeekDate] = useState(today);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Mobile mini calendar
  const [miniDate, setMiniDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(todayStr);

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) ?? null : null;

  // Desktop week label
  const ws = weekStart(weekDate);
  const we = weekEnd(weekDate);
  const wsMonth = ws.getMonth(), weMonth = we.getMonth();
  const weekLabel = wsMonth === weMonth
    ? `${ws.getDate()} – ${we.getDate()} de ${MONTHS[wsMonth]}, ${ws.getFullYear()}`
    : `${ws.getDate()} ${MONTHS[wsMonth].slice(0,3)} – ${we.getDate()} ${MONTHS[weMonth].slice(0,3)} ${ws.getFullYear()}`;
  const navWeek = (dir: number) => {
    const d = new Date(weekDate); d.setDate(d.getDate() + dir * 7); setWeekDate(d);
  };

  // Mini calendar cells
  const mY = miniDate.getFullYear(), mM = miniDate.getMonth();
  const first = new Date(mY, mM, 1);
  let dow = first.getDay(); dow = dow === 0 ? 6 : dow - 1;
  const startCell = new Date(mY, mM, 1 - dow);
  const miniCells = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(startCell); d.setDate(startCell.getDate() + i);
    const ds = fd(d), inM = d.getMonth() === mM;
    const dayEvs = inM ? events.filter(e => e.data === ds) : [];
    return { day: d.getDate(), ds, inM, isToday: ds === todayStr, isSelected: ds === selectedDay, dayEvs };
  });

  // Events for selected day
  const selectedDayEvs = events
    .filter(e => e.data === selectedDay)
    .sort((a, b) => (a.hora ?? '').localeCompare(b.hora ?? ''));

  // Format selected day label
  const selDate = new Date(selectedDay + 'T12:00:00');
  const selLabel = `${DAYS_PT[selDate.getDay()]}, ${selDate.getDate()} de ${MONTHS[selDate.getMonth()]}`;

  if (isMobile) {
    return (
      <AppShell onAddEvent={() => router.push('/calendario')}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#F5F6FA' }}>

          {/* Mini Calendar */}
          <div style={{ background: '#fff', padding: '16px 16px 12px', flexShrink: 0 }}>

            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <button
                onClick={() => setMiniDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >‹</button>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#101828' }}>
                {MONTHS[mM]} {mY}
              </span>
              <button
                onClick={() => setMiniDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >›</button>
            </div>

            {/* Day labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
              {DAY_LABELS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {miniCells.map(cell => (
                <div
                  key={cell.ds}
                  onClick={() => { if (cell.inM) setSelectedDay(cell.ds); }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0', cursor: cell.inM ? 'pointer' : 'default' }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: cell.isToday || cell.isSelected ? 700 : 400,
                    color: cell.isSelected ? '#fff' : cell.isToday ? '#2E5AAC' : cell.inM ? '#101828' : '#C4C9D4',
                    background: cell.isSelected ? '#2E5AAC' : cell.isToday && !cell.isSelected ? '#EEF2FF' : 'transparent',
                    transition: 'all 0.12s',
                  }}>
                    {cell.day}
                  </span>
                  {/* Event dots */}
                  {cell.dayEvs.length > 0 && (
                    <div style={{ display: 'flex', gap: 2, marginTop: 2, height: 5 }}>
                      {cell.dayEvs.slice(0, 3).map(ev => (
                        <span key={ev.id} style={{ width: 4, height: 4, borderRadius: '50%', background: COR_MAP[ev.cor] ?? '#2E5AAC', flexShrink: 0 }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Events for selected day */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 100px' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#101828' }}>{selLabel}</div>
                <div style={{ fontSize: 12, color: '#9AA3B5', marginTop: 1 }}>
                  {selectedDayEvs.length > 0
                    ? `${selectedDayEvs.length} evento${selectedDayEvs.length > 1 ? 's' : ''}`
                    : 'Sem eventos'}
                </div>
              </div>
              <button
                onClick={() => router.push(`/calendario?date=${selectedDay}&view=dia`)}
                style={{ fontSize: 12, color: '#2E5AAC', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}
              >Ver dia →</button>
            </div>

            {selectedDayEvs.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 12, padding: '32px 20px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F0F4FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M8 2V5M16 2V5M3 8H21M5 4H19C20.105 4 21 4.895 21 6V19C21 20.105 20.105 21 19 21H5C3.895 21 3 20.105 3 19V6C3 4.895 3.895 4 5 4Z" stroke="#9AA3B5" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={{ fontSize: 13, color: '#9AA3B5' }}>Nenhum evento neste dia</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedDayEvs.map(ev => {
                  const color = COR_MAP[ev.cor] ?? '#2E5AAC';
                  const label = ev.type === 'culto' ? 'Culto' : 'Atividade';
                  const details = [ev.pastor, ev.responsavel, ev.adoracao?.responsavel].filter(Boolean);
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventId(ev.id)}
                      style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                    >
                      <div style={{ width: 4, background: color, flexShrink: 0 }} />
                      <div style={{ padding: '12px 14px', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: '0.02em' }}>{label}</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#101828', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.nome}</div>
                        {details.length > 0 && (
                          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{details[0]}</div>
                        )}
                        {ev.hora && (
                          <div style={{ fontSize: 12, color: '#9AA3B5', marginTop: 4, fontWeight: 500 }}>{ev.hora.slice(0,5)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

  // ── Desktop ──────────────────────────────────────────────────────────────
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
