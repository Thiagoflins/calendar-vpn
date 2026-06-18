'use client';
import { CalendarEvent } from '@/types';
import { getColor } from '@/lib/colors';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const H = 64, ABS_START = 7, ABS_END = 22;

type Props = {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (id: string) => void;
};

export function CalendarDayView({ date, events, onEventClick }: Props) {
  const eventHours = events.map(e => parseInt(e.hora?.split(':')[0] ?? '12'));
  const START = eventHours.length > 0 ? Math.max(ABS_START, Math.min(...eventHours) - 1) : ABS_START;
  const END = eventHours.length > 0 ? Math.min(ABS_END, Math.max(...eventHours) + 2) : Math.min(ABS_END, 20);

  function evTop(hora: string) {
    const [h, m] = hora.split(':').map(Number);
    return (h - START) * H + m;
  }

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

      <div style={{ display: 'flex', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
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
            const participants: string[] = [];
            if (ev.pastor) participants.push(ev.pastor);
            if (ev.responsavel) participants.push(ev.responsavel);
            if (ev.adoracao?.responsavel) participants.push(ev.adoracao.responsavel);
            if (ev.organizacao?.responsavel) participants.push(ev.organizacao.responsavel);
            return (
              <div
                key={ev.id}
                onClick={() => onEventClick(ev.id)}
                style={{ position: 'absolute', top: evTop(ev.hora), left: 8, right: 8, minHeight: 70, background: cl.bg, borderRadius: 8, padding: '10px 14px', cursor: 'pointer', border: `1px solid ${cl.dot}30`, borderLeft: `4px solid ${cl.dot}`, boxShadow: '0 2px 8px rgba(16,24,40,0.08)', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 4, transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 14px rgba(16,24,40,0.13)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(16,24,40,0.08)'}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: cl.text, lineHeight: 1.4 }}>{ev.nome}</div>
                {ev.observacao && <div style={{ fontSize: 12, color: cl.text, opacity: 0.7, lineHeight: 1.5 }}>{ev.observacao}</div>}
                {ev.pastor && <div style={{ fontSize: 12, color: cl.text, opacity: 0.8 }}>Pastor: {ev.pastor}</div>}
                {ev.responsavel && <div style={{ fontSize: 12, color: cl.text, opacity: 0.8 }}>Responsável: {ev.responsavel}</div>}
                <div style={{ fontSize: 11, color: cl.text, opacity: 0.6, fontWeight: 500 }}>{ev.hora.slice(0, 5)}</div>
                {participants.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                    {participants.slice(0, 5).map((name, i) => (
                      <span key={i} title={name} style={{ marginLeft: i > 0 ? -6 : 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: cl.dot, color: '#fff', fontSize: 9, fontWeight: 700, border: `2px solid ${cl.bg}`, flexShrink: 0 }}>
                        {name.trim().split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    ))}
                    {participants.length > 5 && <span style={{ fontSize: 10, color: cl.text, opacity: 0.6, marginLeft: 6 }}>+{participants.length - 5}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
