'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardWeekCalendar } from '@/components/dashboard/DashboardWeekCalendar';
import { EventDetailModal } from '@/components/calendar/EventDetailModal';
import { useEvents, useRemoveEvent } from '@/hooks/useEvents';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { MONTHS, DAYS_ABREV, fd, weekStart, weekEnd } from '@/lib/dateUtils';
import { getInitials } from '@/lib/personUtils';

export default function HomePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const today = new Date();
  const todayStr = fd(today);

  const { data: events = [] } = useEvents();
  const deleteEvent = useRemoveEvent();

  const [weekDate, setWeekDate] = useState(today);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedDayDs, setSelectedDayDs] = useState<string | null>(todayStr);
  const { data: user } = useCurrentUser();

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) ?? null : null;

  // Desktop week nav
  const ws = weekStart(weekDate);
  const we = weekEnd(weekDate);
  const wsMonth = ws.getMonth(), weMonth = we.getMonth();
  const weekLabel = wsMonth === weMonth
    ? `${ws.getDate()} – ${we.getDate()} de ${MONTHS[wsMonth]}, ${ws.getFullYear()}`
    : `${ws.getDate()} ${MONTHS[wsMonth].slice(0,3)} – ${we.getDate()} ${MONTHS[weMonth].slice(0,3)} ${ws.getFullYear()}`;
  const navWeek = (dir: number) => {
    const d = new Date(weekDate); d.setDate(d.getDate() + dir * 7); setWeekDate(d);
    setSelectedDayDs(null);
  };

  const upcomingEvents = events
    .filter(e => e.data >= todayStr)
    .sort((a, b) => a.data.localeCompare(b.data) || (a.hora ?? '').localeCompare(b.hora ?? ''))
    .slice(0, 5);

  if (isMobile) {
    return (
      <AppShell onAddEvent={() => router.push('/calendario')}>
        <div style={{ background: '#F5F6FA', minHeight: '100%', padding: '20px 16px 100px', fontFamily: "'Outfit', sans-serif" }}>

          {/* Perfil do usuário */}
          <div className="vpn-stagger-1" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 13, background: '#1C3568',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 17, fontWeight: 700, flexShrink: 0,
            }}>
              {getInitials(user?.nome, user?.email)}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#101828', lineHeight: 1.3 }}>
                {user?.nome ?? 'Usuário'}
              </div>
              <div style={{ fontSize: 12, color: '#9AA3B5', marginTop: 2 }}>
                {user?.email ?? ''}
              </div>
            </div>
          </div>

          {/* Acesso Rápido */}
          <div className="vpn-stagger-2" style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9AA3B5', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Acesso Rápido
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                {
                  label: 'Novo evento', color: '#5350C4',
                  icon: (
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path d="M8 2V5M16 2V5M3 8H21M5 4H19C20.105 4 21 4.895 21 6V19C21 20.105 20.105 21 19 21H5C3.895 21 3 20.105 3 19V6C3 4.895 3.895 4 5 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M12 11V16M9.5 13.5H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ),
                  action: () => router.push('/calendario'),
                },
                {
                  label: 'Calendário', color: '#1B9E75',
                  icon: (
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path d="M8 2V5M16 2V5M3 8H21M5 4H19C20.105 4 21 4.895 21 6V19C21 20.105 20.105 21 19 21H5C3.895 21 3 20.105 3 19V6C3 4.895 3.895 4 5 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ),
                  action: () => router.push('/calendario'),
                },
                {
                  label: 'Pessoas', color: '#7C6FCF',
                  icon: (
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path d="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M23 21V19C22.999 17.153 21.765 15.537 20 15.09M16 3.13C17.769 3.579 19.006 5.198 19.006 7.05C19.006 8.902 17.769 10.521 16 10.97M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                  action: () => router.push('/pessoas'),
                },
                {
                  label: 'Organização', color: '#E07A2A',
                  icon: (
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path d="M3 21H21M6 21V8L12 3L18 8V21M9 21V15H15V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                  action: () => router.push('/organizacao'),
                },
              ].map(card => (
                <button key={card.label} onClick={card.action} style={{
                  background: '#fff', borderRadius: 14, padding: '16px 14px',
                  border: 'none', cursor: 'pointer', display: 'flex',
                  flexDirection: 'column', alignItems: 'flex-start', gap: 12,
                  textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 18px rgba(0,0,0,0.09)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                >
                  <div style={{ color: card.color }}>{card.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{card.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Próximos Eventos */}
          <div className="vpn-stagger-3">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9AA3B5', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Próximos Eventos
              </div>
              <button onClick={() => router.push('/calendario')} style={{
                fontSize: 13, color: '#2E5AAC', fontWeight: 500,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
              }}>
                Ver todos
              </button>
            </div>

            {upcomingEvents.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 12, padding: '24px 16px', textAlign: 'center', fontSize: 13, color: '#9AA3B5' }}>
                Nenhum evento próximo
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {upcomingEvents.map((ev, idx) => {
                  const d = new Date(ev.data + 'T12:00:00');
                  const dayAbbrev = DAYS_ABREV[d.getDay()].toUpperCase();
                  const dayNum = d.getDate();
                  const isLast = idx === upcomingEvents.length - 1;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEventId(ev.id)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 16,
                        padding: '12px 4px',
                        border: 'none',
                        borderBottom: isLast ? 'none' : '1px solid #EDE8DF',
                        background: 'none',
                        cursor: 'pointer', textAlign: 'left', width: '100%',
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      <div style={{ width: 42, flexShrink: 0, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#A8A59E', letterSpacing: '0.06em', lineHeight: 1 }}>
                          {dayAbbrev}
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 700, color: '#101828', lineHeight: 1.1 }}>
                          {dayNum}
                        </div>
                      </div>
                      <div style={{ paddingTop: 2 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#101828' }}>· {ev.nome}</div>
                        {ev.hora && (
                          <div style={{ fontSize: 12, color: '#9AA3B5', marginTop: 3 }}>{ev.hora.slice(0, 5)}</div>
                        )}
                      </div>
                    </button>
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

          {/* ── Header ── */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#101828' }}>{weekLabel}</div>
            </div>
            <button onClick={() => { setWeekDate(today); setSelectedDayDs(todayStr); }} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 12, cursor: 'pointer', transition: 'background 0.13s, border-color 0.13s' }} onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#F5F7FA'; el.style.borderColor = '#D1D5DB'; }} onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#fff'; el.style.borderColor = '#E5E7EB'; }}>Hoje</button>
            <div style={{ display: 'flex', gap: 2 }}>
              <button onClick={() => navWeek(-1)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.13s, border-color 0.13s' }} onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#F5F7FA'; el.style.borderColor = '#D1D5DB'; }} onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#fff'; el.style.borderColor = '#E5E7EB'; }}>‹</button>
              <button onClick={() => navWeek(1)}  style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.13s, border-color 0.13s' }} onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#F5F7FA'; el.style.borderColor = '#D1D5DB'; }} onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#fff'; el.style.borderColor = '#E5E7EB'; }}>›</button>
            </div>
            <button
              onClick={() => router.push('/calendario')}
              style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: '#2E5AAC', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500, transition: 'background 0.13s, transform 0.12s, box-shadow 0.13s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#23478A'; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 4px 14px rgba(46,90,172,0.32)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#2E5AAC'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
            >Ver calendário</button>
          </div>

          {/* ── Calendário da semana (dia selecionado filtra os eventos) ── */}
          <DashboardWeekCalendar
            date={weekDate}
            events={events}
            onEventClick={id => setSelectedEventId(id)}
            onDayClick={ds => setSelectedDayDs(prev => prev === ds ? null : ds)}
            selectedDay={selectedDayDs}
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
