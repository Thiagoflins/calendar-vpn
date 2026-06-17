'use client';
import { CalendarEvent } from '@/types';
import { getColor } from '@/lib/colors';

function initials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

type Props = {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
  compact?: boolean;
};

export function EventCard({ event, onClick, compact }: Props) {
  const cl = getColor(event.cor);

  const participants: string[] = [];
  if (event.pastor) participants.push(event.pastor);
  if (event.responsavel) participants.push(event.responsavel);
  if (event.adoracao?.responsavel) participants.push(event.adoracao.responsavel);
  if (event.organizacao?.responsavel) participants.push(event.organizacao.responsavel);
  const visible = participants.slice(0, 3);
  const extra = participants.length - visible.length;

  if (compact) {
    // Mês: card compacto, só título + horário
    return (
      <div
        onClick={onClick}
        style={{
          background: cl.bg,
          border: `1px solid ${cl.dot}30`,
          borderLeft: `4px solid ${cl.dot}`,
          borderRadius: 6,
          padding: '5px 8px',
          cursor: 'pointer',
          marginBottom: 3,
          boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
          transition: 'box-shadow 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 3px 8px rgba(16,24,40,0.10)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 2px rgba(16,24,40,0.05)'; }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: cl.text, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {event.nome}
        </div>
        <div style={{ fontSize: 10, color: cl.text, opacity: 0.65, marginTop: 1 }}>
          {event.hora.slice(0, 5)}{event.pastor ? ` · ${event.pastor.split(' ')[0]}` : ''}
        </div>
      </div>
    );
  }

  // Semana / Dia: card expandido estilo Tiimi
  return (
    <div
      onClick={onClick}
      style={{
        background: cl.bg,
        border: `1px solid ${cl.dot}30`,
        borderLeft: `4px solid ${cl.dot}`,
        borderRadius: 8,
        padding: '10px 12px 10px 12px',
        cursor: 'pointer',
        marginBottom: 4,
        boxShadow: '0 1px 4px rgba(16,24,40,0.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(16,24,40,0.12)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(16,24,40,0.07)'; }}
    >
      {/* Título */}
      <div style={{ fontSize: 13, fontWeight: 700, color: cl.text, lineHeight: 1.4 }}>
        {event.nome}
      </div>

      {/* Observação */}
      {event.observacao && (
        <div style={{ fontSize: 11, color: cl.text, opacity: 0.7, lineHeight: 1.5 }}>
          {event.observacao}
        </div>
      )}

      {/* Pastor / Responsável */}
      {event.pastor && (
        <div style={{ fontSize: 11, color: cl.text, opacity: 0.75 }}>
          Pastor: {event.pastor}
        </div>
      )}
      {event.responsavel && (
        <div style={{ fontSize: 11, color: cl.text, opacity: 0.75 }}>
          Responsável: {event.responsavel}
        </div>
      )}

      {/* Horário */}
      <div style={{ fontSize: 11, color: cl.text, opacity: 0.65, fontWeight: 500 }}>
        {event.hora.slice(0, 5)}
      </div>

      {/* Avatars */}
      {visible.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
          {visible.map((name, i) => (
            <span
              key={i}
              title={name}
              style={{
                marginLeft: i > 0 ? -6 : 0,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: '50%',
                background: cl.dot, color: '#fff',
                fontSize: 8, fontWeight: 700,
                border: `2px solid ${cl.bg}`,
                flexShrink: 0,
              }}
            >
              {initials(name)}
            </span>
          ))}
          {extra > 0 && (
            <span style={{ fontSize: 10, color: cl.text, opacity: 0.6, marginLeft: 6 }}>
              +{extra} others
            </span>
          )}
        </div>
      )}
    </div>
  );
}
