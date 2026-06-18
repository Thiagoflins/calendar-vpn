'use client';
import { CalendarEvent } from '@/types';
import { EventCard } from './EventCard';
import { useIsMobile } from '@/hooks/useIsMobile';

const DAYS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

function fd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

type Props = {
  date: Date;
  events: CalendarEvent[];
  onDayClick: (ds: string) => void;
  onEventClick: (id: string) => void;
  selectedDay?: string;
};

export function CalendarMonthView({ date, events, onDayClick, onEventClick, selectedDay }: Props) {
  const isMobile = useIsMobile();
  const today = fd(new Date());
  const y = date.getFullYear(), m = date.getMonth();
  const first = new Date(y, m, 1);
  let dow = first.getDay(); dow = dow === 0 ? 6 : dow - 1;
  const start = new Date(y, m, 1 - dow);

  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const ds = fd(d), inMo = d.getMonth() === m;
    const dayEvs = inMo ? events.filter(e => e.data === ds) : [];
    const isSel = selectedDay ? ds === selectedDay : ds === today;
    return { ds, day: d.getDate(), inMo, isToday: ds === today, isSel, dayEvs, i };
  });

  const dayLabels = DAYS;
  const cellMinH = isMobile ? 46 : 110;
  const maxEventsShown = isMobile ? 1 : 3;

  return (
    <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid #E5E7EB' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E5E7EB', background: '#F7F9FC' }}>
        {dayLabels.map(d => (
          <div key={d} style={{ padding: isMobile ? '6px 2px' : '10px 8px', textAlign: 'center', fontSize: isMobile ? 10 : 11, fontWeight: 700, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map(cell => {
          const isLastRow = cell.i >= 35, isLastCol = cell.i % 7 === 6;
          const shown = cell.dayEvs.slice(0, maxEventsShown);
          const extra = cell.dayEvs.length - shown.length;
          return (
            <div
              key={cell.ds}
              onClick={() => cell.inMo && onDayClick(cell.ds)}
              style={{
                minHeight: cellMinH, padding: isMobile ? '5px 3px' : '8px 6px',
                borderRight: isLastCol ? 'none' : '1px solid #E5E7EB',
                borderBottom: isLastRow ? 'none' : '1px solid #E5E7EB',
                background: cell.isSel ? '#F0F7FE' : cell.inMo ? '#fff' : '#FAFBFD',
                cursor: cell.inMo ? 'pointer' : 'default',
              }}
            >
              <div style={{ marginBottom: isMobile ? 2 : 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: isMobile ? 20 : 24, height: isMobile ? 20 : 24, borderRadius: '50%', fontSize: isMobile ? 11 : 13, fontWeight: cell.isSel ? 700 : 500, color: cell.isSel ? '#fff' : cell.inMo ? '#101828' : '#C4C9D4', background: cell.isSel ? '#2E5AAC' : cell.isToday && !cell.isSel ? '#EEF2FF' : 'transparent' }}>
                  {cell.day}
                </span>
              </div>
              {shown.map(ev => (
                <EventCard key={ev.id} event={ev} compact onClick={e => { e.stopPropagation(); onEventClick(ev.id); }} />
              ))}
              {extra > 0 && (
                <div style={{ fontSize: 10, color: '#9AA3B5', paddingLeft: 4, marginTop: 1 }}>+{extra}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
