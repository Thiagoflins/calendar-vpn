'use client';
import { CalendarEvent } from '@/types';
import { getColor } from '@/lib/colors';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const H = 64, START = 7, END = 22;

function evTop(hora: string) {
  const [h, m] = hora.split(':').map(Number);
  return (h - START) * H + m;
}

type Props = {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (id: string) => void;
};

export function CalendarDayView({ date, events, onEventClick }: Props) {
  const slots = Array.from({ length: END - START + 1 }, (_, i) => START + i);

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid #E5E7EB' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1B2230', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff' }}>{date.getDate()}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#101828' }}>{MONTHS[date.getMonth()]} {date.getFullYear()}</div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>{events.length} evento{events.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', overflowY: 'auto', maxHeight: 560 }}>
        <div style={{ width: 60, flexShrink: 0 }}>
          {slots.map(h => (
            <div key={h} style={{ height: H, display: 'flex', alignItems: 'flex-start', paddingTop: 6, paddingRight: 8, justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 12, color: '#9AA3B5' }}>{h}:00</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, borderLeft: '1px solid #E5E7EB', position: 'relative', height: (END - START + 1) * H }}>
          {slots.map(h => (
            <div key={h} style={{ position: 'absolute', top: (h - START) * H, left: 0, right: 0, height: H, borderTop: '1px solid #F3F4F6' }} />
          ))}
          {events.map(ev => {
            const cl = getColor(ev.cor);
            const icon = ev.type === 'culto' ? '⛪' : '📅';
            return (
              <div
                key={ev.id}
                onClick={() => onEventClick(ev.id)}
                style={{ position: 'absolute', top: evTop(ev.hora), left: 8, right: 8, minHeight: 58, background: cl.bg, borderRadius: 12, padding: '10px 14px', cursor: 'pointer', borderLeft: `4px solid ${cl.dot}`, boxShadow: '0 2px 8px rgba(16,24,40,0.08)', zIndex: 1 }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: cl.text }}>{icon} {ev.nome}</div>
                <div style={{ fontSize: 12, color: cl.text, opacity: 0.8, marginTop: 2 }}>{ev.hora}</div>
                {ev.pastor && <div style={{ fontSize: 12, color: cl.text, opacity: 0.7, marginTop: 4 }}>Pastor: {ev.pastor}</div>}
                {ev.responsavel && <div style={{ fontSize: 12, color: cl.text, opacity: 0.7, marginTop: 4 }}>Resp.: {ev.responsavel}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
