'use client';
import { CalendarEvent } from '@/types';
import { getColor } from '@/lib/colors';

function fmtDatePT(ds: string) {
  if (!ds) return '';
  const [y, mo, d] = ds.split('-');
  return `${d}/${mo}/${y}`;
}

type Props = {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function EventDetailModal({ event, onClose, onEdit, onDelete }: Props) {
  const cl = getColor(event.cor);
  const icon = event.type === 'culto' ? '⛪' : '📅';
  const lbl = event.type === 'culto' ? 'Culto' : 'Atividade';

  const Tags = ({ items }: { items: string[] }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
      {items.map((m, i) => (
        <span key={i} style={{ fontSize: 12, fontWeight: 500, color: cl.text, background: cl.bg, padding: '2px 9px', borderRadius: 999 }}>{m}</span>
      ))}
    </div>
  );

  const Row = ({ icon: ic, label, children }: { icon: string; label?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ fontSize: 16, width: 20, flexShrink: 0, marginTop: 2 }}>{ic}</span>
      <div style={{ flex: 1 }}>
        {label && <div style={{ fontSize: 11, fontWeight: 700, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>}
        {children}
      </div>
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(16,24,40,0.35)', backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 48px rgba(16,24,40,0.16)' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: cl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>{event.nome}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: cl.dot, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{lbl}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#9AA3B5', padding: 4, borderRadius: 8, lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '4px 24px', overflow: 'auto', flex: 1 }}>
          {event.descricao && (
            <Row icon="📝">
              <span style={{ fontSize: 14, color: '#374151', lineHeight: '1.5' }}>{event.descricao}</span>
            </Row>
          )}
          <Row icon="📅">
            <span style={{ fontSize: 14, color: '#101828' }}>{fmtDatePT(event.data)} · {event.hora}</span>
          </Row>
          {event.pastor && (
            <Row icon="🙏" label="Pastor">
              <span style={{ fontSize: 14, color: '#101828', fontWeight: 600 }}>{event.pastor}</span>
            </Row>
          )}
          {event.responsavel && (
            <Row icon="👤" label="Responsável">
              <span style={{ fontSize: 14, color: '#101828', fontWeight: 600 }}>{event.responsavel}</span>
            </Row>
          )}
          {event.adoracao && (event.adoracao.responsavel || event.adoracao.membros?.length > 0) && (
            <Row icon="🎵" label="Adoração">
              {event.adoracao.responsavel && <div style={{ fontSize: 14, color: '#101828', fontWeight: 600 }}>{event.adoracao.responsavel}</div>}
              {event.adoracao.membros?.length > 0 && <Tags items={event.adoracao.membros} />}
            </Row>
          )}
          {event.organizacao && (event.organizacao.responsavel || event.organizacao.membros?.length > 0) && (
            <Row icon="📋" label="Organização">
              {event.organizacao.responsavel && <div style={{ fontSize: 14, color: '#101828', fontWeight: 600 }}>{event.organizacao.responsavel}</div>}
              {event.organizacao.membros?.length > 0 && <Tags items={event.organizacao.membros} />}
            </Row>
          )}
          {(event.equipe?.length ?? 0) > 0 && (
            <Row icon="👥" label="Equipe">
              <Tags items={event.equipe!} />
            </Row>
          )}
          {event.observacao && (
            <Row icon="💬">
              <span style={{ fontSize: 14, color: '#374151', lineHeight: '1.5' }}>{event.observacao}</span>
            </Row>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onDelete} style={{ padding: '8px 16px', background: '#FBEAF0', color: '#993556', border: 'none', fontSize: 13, fontWeight: 600, borderRadius: 10, cursor: 'pointer' }}>🗑️ Excluir</button>
          <button onClick={onEdit} style={{ padding: '8px 20px', background: '#2E5AAC', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: 'pointer' }}>✏️ Editar</button>
        </div>
      </div>
    </div>
  );
}
