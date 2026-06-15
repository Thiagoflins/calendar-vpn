import { CalendarEvent } from '@/types';
import { getColor } from '@/lib/colors';

type Props = {
  event: CalendarEvent;
  onClick: () => void;
  compact?: boolean;
};

export function EventCard({ event, onClick, compact }: Props) {
  const cl = getColor(event.cor);
  const icon = event.type === 'culto' ? '⛪' : '📅';

  return (
    <div
      onClick={onClick}
      style={{
        background: cl.bg, borderRadius: 6, padding: compact ? '5px 8px' : '8px 10px',
        cursor: 'pointer', borderLeft: `3px solid ${cl.dot}`, marginBottom: 4,
        transition: 'box-shadow 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 2 }}>
        <span style={{ fontSize: 11, flexShrink: 0, marginTop: 1 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: cl.text, lineHeight: '1.3' }}>{event.nome}</span>
      </div>
      <div style={{ fontSize: 11, color: cl.text, opacity: 0.8, fontWeight: 500 }}>{event.hora}</div>
      {!compact && event.pastor && (
        <div style={{ fontSize: 11, color: cl.text, opacity: 0.7, marginTop: 2 }}>
          Pr. {event.pastor.split(' ').slice(-1)[0]}
        </div>
      )}
      {!compact && event.responsavel && (
        <div style={{ fontSize: 11, color: cl.text, opacity: 0.7, marginTop: 2 }}>
          {event.responsavel.split(' ')[0]}
        </div>
      )}
      {!compact && event.adoracao?.responsavel && (
        <div style={{ fontSize: 11, color: cl.text, opacity: 0.6, marginTop: 1 }}>
          🎵 {event.adoracao.responsavel.split(' ')[0]}
        </div>
      )}
    </div>
  );
}
