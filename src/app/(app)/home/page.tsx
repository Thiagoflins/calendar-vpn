'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardWeekCalendar } from '@/components/dashboard/DashboardWeekCalendar';
import { EventDetailModal } from '@/components/calendar/EventDetailModal';
import { useEvents, useRemoveEvent } from '@/hooks/useEvents';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

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
  const today = new Date();

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

  return (
    <AppShell onAddEvent={() => router.push('/calendario')}>
      <div style={{ height: '100%', overflow: 'hidden', padding: '16px 20px' }}>
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
