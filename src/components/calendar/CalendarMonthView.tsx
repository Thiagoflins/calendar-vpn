'use client';
import { CalendarEvent } from '@/types';
import { EventCard } from './EventCard';

const DAYS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

function fd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

type Props = {
  date: Date;
  events: CalendarEvent[];
  onDayClick: (ds: string) => void;
  onEventClick: (id: string) => void;
};

export function CalendarMonthView({ date, events, onDayClick, onEventClick }: Props) {
  const today = fd(new Date());
  const y = date.getFullYear(), m = date.getMonth();
  const first = new Date(y, m, 1);
  let dow = first.getDay(); dow = dow === 0 ? 6 : dow - 1;
  const start = new Date(y, m, 1 - dow);

  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const ds = fd(d), inMo = d.getMonth() === m;
    const dayEvs = inMo ? events.filter(e => e.data === ds) : [];
    return { ds, day: d.getDate(), inMo, isToday: ds === today, dayEvs, i };
  });

  return (
    <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid #E5E7EB' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E5E7EB', background: '#F7F9FC' }}>
        {DAYS.map(d => (
          <div key={d} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map(cell => {
          const isLastRow = cell.i >= 35, isLastCol = cell.i % 7 === 6;
          return (
            <div
              key={cell.ds}
              onClick={() => cell.inMo && onDayClick(cell.ds)}
              style={{
                minHeight: 110, padding: '8px 6px',
                borderRight: isLastCol ? 'none' : '1px solid #E5E7EB',
                borderBottom: isLastRow ? 'none' : '1px solid #E5E7EB',
                background: cell.isToday ? '#F0F7FE' : cell.inMo ? '#fff' : '#FAFBFD',
                cursor: cell.inMo ? 'pointer' : 'default',
              }}
            >
              <div style={{ marginBottom: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', fontSize: 13, fontWeight: cell.isToday ? 700 : 500, color: cell.isToday ? '#fff' : cell.inMo ? '#101828' : '#C4C9D4', background: cell.isToday ? '#2E5AAC' : 'transparent' }}>
                  {cell.day}
                </span>
              </div>
              {cell.dayEvs.map(ev => (
                <EventCard key={ev.id} event={ev} onClick={e => { e.stopPropagation(); onEventClick(ev.id); }} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
