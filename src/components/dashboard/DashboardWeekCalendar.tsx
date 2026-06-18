'use client';
import { CalendarEvent } from '@/types';
import { getColor } from '@/lib/colors';

const DAYS_ABBR = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
const H = 52;
const START = 7;
const END = 22;

function fd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function weekStart(d: Date) {
  const r = new Date(d);
  let dw = r.getDay();
  dw = dw === 0 ? 6 : dw - 1;
  r.setDate(r.getDate() - dw);
  return r;
}

function evTop(hora: string) {
  const [h, m] = hora.split(':').map(Number);
  return (h - START) * H + (m / 60) * H;
}

type Props = {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (id: string) => void;
  onDayClick: (ds: string) => void;
  selectedDay?: string | null;
};

export function DashboardWeekCalendar({ date, events, onEventClick, onDayClick, selectedDay }: Props) {
  const today = fd(new Date());
  const ws = weekStart(date);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws);
    d.setDate(ws.getDate() + i);
    const ds = fd(d);
    return { ds, abbr: DAYS_ABBR[i], num: d.getDate(), isToday: ds === today, evs: events.filter(e => e.data === ds) };
  });
  const slots = Array.from({ length: END - START + 1 }, (_, i) => START + i);
  const totalH = (END - START + 1) * H;

  const now = new Date();
  const nowTop = (now.getHours() - START) * H + (now.getMinutes() / 60) * H;
  const showNowLine = now.getHours() >= START && now.getHours() <= END && days.some(d => d.isToday);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(7, 1fr)', borderBottom: '1px solid #F0F2F5', flexShrink: 0 }}>
        <div />
        {days.map(day => {
          const isSel = selectedDay === day.ds;
          const isActive = day.isToday || isSel;
          return (
            <div
              key={day.ds}
              onClick={() => onDayClick(day.ds)}
              style={{
                padding: '10px 4px 10px', textAlign: 'center', cursor: 'pointer',
                borderLeft: '1px solid #F0F2F5',
                transition: 'background 0.13s',
                background: isSel && !day.isToday ? '#F0F7FE' : 'transparent',
                borderBottom: isActive ? '2px solid #2E5AAC' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = '#F5F7FC'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = isSel ? '#F0F7FE' : 'transparent'; }}
            >
              <div style={{ fontSize: 9, fontWeight: 600, color: isActive ? '#2E5AAC' : '#9AA3B5', letterSpacing: '0.08em', marginBottom: 5 }}>{day.abbr}</div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 6,
                fontSize: 15, fontWeight: isActive ? 700 : 400,
                background: day.isToday ? '#2E5AAC' : isSel ? 'rgba(46,90,172,0.15)' : 'transparent',
                color: day.isToday ? '#fff' : isSel ? '#2E5AAC' : '#374151',
                transition: 'background 0.13s',
              }}>{day.num}</div>
              {day.evs.length > 0 && (
                <div style={{ fontSize: 9, color: isActive ? '#2E5AAC' : '#9AA3B5', marginTop: 3 }}>
                  {day.evs.length} evento{day.evs.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex' }}>
        {/* Time labels */}
        <div style={{ width: 44, flexShrink: 0, borderRight: '1px solid #F0F2F5', position: 'relative' }}>
          {slots.map(h => (
            <div key={h} style={{ height: H, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 4 }}>
              <span style={{ fontSize: 10, color: '#C4CAD4', whiteSpace: 'nowrap' }}>{String(h).padStart(2, '0')}h</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const isSel = selectedDay === day.ds;
          const isOther = !!selectedDay && !isSel;
          return (
          <div
            key={day.ds}
            style={{
              flex: 1, borderLeft: '1px solid #F0F2F5', position: 'relative', height: totalH,
              background: isSel ? 'rgba(46,90,172,0.04)' : isOther ? '#FAFBFD' : day.isToday ? 'rgba(46,90,172,0.025)' : 'transparent',
              transition: 'background 0.18s',
            }}
          >
            {/* Hour lines */}
            {slots.map(h => (
              <div key={h} style={{ position: 'absolute', top: (h - START) * H, left: 0, right: 0, height: 1, background: '#F0F2F5' }} />
            ))}
            {/* Half-hour lines */}
            {slots.map(h => (
              <div key={`h${h}`} style={{ position: 'absolute', top: (h - START) * H + H / 2, left: 0, right: 0, height: 1, background: '#F7F8FA' }} />
            ))}

            {/* Current time line */}
            {day.isToday && showNowLine && (
              <div style={{ position: 'absolute', top: nowTop, left: 0, right: 0, height: 2, background: '#EF4444', zIndex: 3, pointerEvents: 'none' }}>
                <div className="vpn-now-dot" style={{
                  position: 'absolute', left: -5, top: '50%',
                  width: 10, height: 10, borderRadius: '50%', background: '#EF4444',
                }} />
              </div>
            )}

            {/* Events — só mostra se não há dia selecionado, ou se este é o dia selecionado */}
            {(!selectedDay || isSel) && day.evs.map(ev => {
              const cl = getColor(ev.cor);
              const person = ev.pastor || ev.responsavel || '';
              return (
                <div
                  key={ev.id}
                  onClick={() => onEventClick(ev.id)}
                  style={{
                    position: 'absolute',
                    top: evTop(ev.hora) + 2,
                    left: 3, right: 3,
                    minHeight: 44,
                    background: cl.bg,
                    borderRadius: 8,
                    padding: '7px 9px',
                    cursor: 'pointer',
                    border: `1px solid ${cl.dot}30`,
                    borderLeft: `4px solid ${cl.dot}`,
                    boxShadow: '0 1px 4px rgba(16,24,40,0.07)',
                    zIndex: 2,
                    display: 'flex', flexDirection: 'column', gap: 2,
                    transition: 'box-shadow 0.12s, transform 0.12s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = '0 4px 16px rgba(16,24,40,0.14)'; el.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = '0 1px 4px rgba(16,24,40,0.07)'; el.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: cl.text, lineHeight: 1.4 }}>{ev.nome}</div>
                  <div style={{ fontSize: 10, color: cl.text, opacity: 0.65, fontWeight: 500 }}>
                    {ev.hora.slice(0, 5)}{person ? ` · ${person.split(' ')[0]}` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        );
        })}
      </div>
    </div>
  );
}
