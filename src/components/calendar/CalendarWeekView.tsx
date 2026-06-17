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
  const today = fd(new Date());
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
              const participants: string[] = [];
              if (ev.pastor) participants.push(ev.pastor);
              if (ev.responsavel) participants.push(ev.responsavel);
              if (ev.adoracao?.responsavel) participants.push(ev.adoracao.responsavel);
              const visible = participants.slice(0, 3);
              const extra = participants.length - visible.length;
              return (
                <div
                  key={ev.id}
                  onClick={() => onEventClick(ev.id)}
                  style={{ position: 'absolute', top: evTop(ev.hora), left: 4, right: 4, minHeight: 60, background: cl.bg, borderRadius: 8, padding: '8px 10px', cursor: 'pointer', border: `1px solid ${cl.dot}30`, borderLeft: `4px solid ${cl.dot}`, boxShadow: '0 1px 4px rgba(16,24,40,0.07)', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 3, transition: 'box-shadow 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(16,24,40,0.12)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(16,24,40,0.07)'}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: cl.text, lineHeight: 1.4 }}>{ev.nome}</div>
                  <div style={{ fontSize: 10, color: cl.text, opacity: 0.65, fontWeight: 500 }}>{ev.hora.slice(0, 5)}{ev.pastor ? ` · ${ev.pastor.split(' ')[0]}` : ''}</div>
                  {visible.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', paddingTop: 2 }}>
                      {visible.map((name, i) => (
                        <span key={i} title={name} style={{ marginLeft: i > 0 ? -6 : 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: cl.dot, color: '#fff', fontSize: 8, fontWeight: 700, border: `2px solid ${cl.bg}`, flexShrink: 0 }}>
                          {name.trim().split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      ))}
                      {extra > 0 && <span style={{ fontSize: 9, color: cl.text, opacity: 0.6, marginLeft: 5 }}>+{extra}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
