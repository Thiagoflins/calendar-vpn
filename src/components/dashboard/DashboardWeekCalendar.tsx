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
};

export function DashboardWeekCalendar({ date, events, onEventClick, onDayClick }: Props) {
  const today = fd(new Date(2026, 5, 15));
  const ws = weekStart(date);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws);
    d.setDate(ws.getDate() + i);
    const ds = fd(d);
    return { ds, abbr: DAYS_ABBR[i], num: d.getDate(), isToday: ds === today, evs: events.filter(e => e.data === ds) };
  });
  const slots = Array.from({ length: END - START + 1 }, (_, i) => START + i);
  const totalH = (END - START + 1) * H;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(7, 1fr)', borderBottom: '1px solid #F0F2F5', flexShrink: 0 }}>
        <div />
        {days.map(day => (
          <div
            key={day.ds}
            onClick={() => onDayClick(day.ds)}
            style={{ padding: '10px 4px 10px', textAlign: 'center', cursor: 'pointer', borderLeft: '1px solid #F0F2F5' }}
          >
            <div style={{ fontSize: 9, fontWeight: 500, color: day.isToday ? '#2E5AAC' : '#9AA3B5', letterSpacing: '0.08em', marginBottom: 5 }}>{day.abbr}</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: 6,
              fontSize: 15, fontWeight: day.isToday ? 600 : 400,
              background: day.isToday ? '#2E5AAC' : 'transparent',
              color: day.isToday ? '#fff' : '#374151',
            }}>{day.num}</div>
            {day.evs.length > 0 && (
              <div style={{ fontSize: 9, color: day.isToday ? '#2E5AAC' : '#9AA3B5', marginTop: 3 }}>
                {day.evs.length} evento{day.evs.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex' }}>
        {/* Time labels */}
        <div style={{ width: 44, flexShrink: 0, borderRight: '1px solid #F0F2F5' }}>
          {slots.map(h => (
            <div key={h} style={{ height: H, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 4 }}>
              <span style={{ fontSize: 10, color: '#C4CAD4', whiteSpace: 'nowrap' }}>{String(h).padStart(2, '0')}h</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, di) => (
          <div
            key={day.ds}
            style={{ flex: 1, borderLeft: '1px solid #F0F2F5', position: 'relative', height: totalH, background: day.isToday ? '#FAFBFF' : 'transparent' }}
          >
            {/* Hour lines */}
            {slots.map(h => (
              <div key={h} style={{ position: 'absolute', top: (h - START) * H, left: 0, right: 0, height: 1, background: '#F0F2F5' }} />
            ))}
            {/* Half-hour lines */}
            {slots.map(h => (
              <div key={`h${h}`} style={{ position: 'absolute', top: (h - START) * H + H / 2, left: 0, right: 0, height: 1, background: '#F7F8FA' }} />
            ))}

            {/* Events */}
            {day.evs.map(ev => {
              const cl = getColor(ev.cor);
              const person = ev.pastor || ev.responsavel || '';
              return (
                <div
                  key={ev.id}
                  onClick={() => onEventClick(ev.id)}
                  style={{
                    position: 'absolute',
                    top: evTop(ev.hora) + 2,
                    left: 3,
                    right: 3,
                    minHeight: 44,
                    background: cl.bg,
                    borderRadius: 8,
                    padding: '7px 9px',
                    cursor: 'pointer',
                    border: `1px solid ${cl.dot}30`,
                    borderLeft: `4px solid ${cl.dot}`,
                    boxShadow: '0 1px 4px rgba(16,24,40,0.07)',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    transition: 'box-shadow 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(16,24,40,0.12)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(16,24,40,0.07)'}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: cl.text, lineHeight: 1.4 }}>{ev.nome}</div>
                  <div style={{ fontSize: 10, color: cl.text, opacity: 0.65, fontWeight: 500 }}>
                    {ev.hora.slice(0, 5)}{person ? ` · ${person.split(' ')[0]}` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
