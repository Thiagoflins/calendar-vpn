'use client';
import { CalendarEvent } from '@/types';
import { getColor } from '@/lib/colors';

const DAYS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
const H = 60, START = 7, END = 22;

function fd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function weekStart(d: Date) {
  const r = new Date(d); let dw = r.getDay(); dw = dw === 0 ? 6 : dw - 1; r.setDate(r.getDate() - dw); return r;
}

function evTop(hora: string) {
  const [h, m] = hora.split(':').map(Number);
  return (h - START) * H + m;
}

type Props = {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (id: string) => void;
};

export function CalendarWeekView({ date, events, onEventClick }: Props) {
  const today = fd(new Date(2026, 5, 15));
  const ws = weekStart(date);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws); d.setDate(ws.getDate() + i);
    const ds = fd(d);
    return { ds, name: DAYS[i], num: d.getDate(), isToday: ds === today, evs: events.filter(e => e.data === ds) };
  });
  const slots = Array.from({ length: END - START + 1 }, (_, i) => START + i);

  return (
    <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(7, 1fr)', borderBottom: '1px solid #E5E7EB', background: '#F7F9FC' }}>
        <div style={{ padding: '12px 8px' }} />
        {days.map(day => (
          <div key={day.ds} style={{ padding: '12px 8px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 9, fontWeight: 500, color: day.isToday ? '#2E5AAC' : '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{day.name}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', fontSize: 15, fontWeight: day.isToday ? 600 : 400, background: day.isToday ? '#2E5AAC' : 'transparent', color: day.isToday ? '#fff' : '#374151' }}>
              {day.num}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div style={{ display: 'flex', overflowY: 'auto', maxHeight: 580 }}>
        {/* Time col */}
        <div style={{ width: 52, flexShrink: 0, borderRight: '1px solid #E5E7EB' }}>
          {slots.map(h => (
            <div key={h} style={{ height: H, display: 'flex', alignItems: 'flex-start', paddingTop: 4, paddingRight: 6, justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 11, color: '#9AA3B5', whiteSpace: 'nowrap' }}>{h}:00</span>
            </div>
          ))}
        </div>

        {/* Day cols */}
        {days.map(day => (
          <div key={day.ds} style={{ flex: 1, borderLeft: '1px solid #F3F4F6', position: 'relative', height: (END - START + 1) * H }}>
            {slots.map(h => (
              <div key={h} style={{ position: 'absolute', top: (h - START) * H, left: 0, right: 0, height: H, borderTop: '1px solid #F3F4F6' }} />
            ))}
            {day.evs.map(ev => {
              const cl = getColor(ev.cor);
              const icon = ev.type === 'culto' ? '⛪' : '📅';
              return (
                <div
                  key={ev.id}
                  onClick={() => onEventClick(ev.id)}
                  style={{ position: 'absolute', top: evTop(ev.hora), left: 4, right: 4, minHeight: 52, background: cl.bg, borderRadius: 6, padding: '7px 10px', cursor: 'pointer', borderLeft: `3px solid ${cl.dot}`, boxShadow: '0 1px 4px rgba(16,24,40,0.06)', zIndex: 1 }}
                >
                  <div style={{ fontSize: 12, fontWeight: 500, color: cl.text, lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{icon} {ev.nome}</div>
                  <div style={{ fontSize: 10, color: cl.dot, marginTop: 2 }}>{ev.hora.slice(0, 5)}</div>
                  {ev.adoracao?.responsavel && <div style={{ fontSize: 11, color: cl.text, opacity: 0.7, marginTop: 2 }}>🎵 {ev.adoracao.responsavel.split(' ')[0]}</div>}
                  {ev.equipe?.length ? <div style={{ fontSize: 11, color: cl.text, opacity: 0.7, marginTop: 2 }}>👥 {ev.equipe[0].split(' ')[0]}{ev.equipe.length > 1 ? `+${ev.equipe.length - 1}` : ''}</div> : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
