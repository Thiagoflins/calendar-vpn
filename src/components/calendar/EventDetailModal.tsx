'use client';
import { useEffect, useState } from 'react';
import { CalendarEvent } from '@/types';
import { getColor } from '@/lib/colors';
import { createClient } from '@/lib/supabase/client';

function fmtDatePT(ds: string) {
  if (!ds) return '';
  const [y, mo, d] = ds.split('-');
  return `${d}/${mo}/${y}`;
}

function fmtTs(ts: string): string {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    + ', ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

type AuditEntry = { action: string; usuario_nome: string; criado_em: string };

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

  const [audit, setAudit] = useState<AuditEntry[]>([]);
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('event_audit_log')
      .select('action, usuario_nome, criado_em')
      .eq('event_id', event.id)
      .order('criado_em', { ascending: true })
      .then(({ data }) => setAudit(data ?? []));
  }, [event.id]);

  const auditCriado = audit.find(a => a.action === 'criado');
  const auditAtualizado = [...audit].reverse().find(a => a.action === 'atualizado');

  const Tags = ({ items }: { items: string[] }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
      {items.map((m, i) => (
        <span key={i} style={{ fontSize: 12, fontWeight: 400, color: cl.text, background: cl.bg, padding: '2px 8px', borderRadius: 4 }}>{m}</span>
      ))}
    </div>
  );

  const Row = ({ icon: ic, label, children }: { icon: string; label?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ fontSize: 16, width: 20, flexShrink: 0, marginTop: 2 }}>{ic}</span>
      <div style={{ flex: 1 }}>
        {label && <div style={{ fontSize: 11, fontWeight: 500, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>}
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
        style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 480, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(16,24,40,0.14)' }}
      >
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: cl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#101828' }}>{event.nome}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: cl.dot, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{lbl}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9AA3B5', padding: 4, borderRadius: 4, lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '4px 22px', overflow: 'auto', flex: 1 }}>
          {event.descricao && (
            <Row icon="📝">
              <span style={{ fontSize: 14, color: '#374151', lineHeight: '1.5' }}>{event.descricao}</span>
            </Row>
          )}
          <Row icon="📅" label="Dia">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#101828' }}>{fmtDatePT(event.data)}</span>
          </Row>
          <Row icon="🕐" label="Horário">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#101828' }}>{event.hora.slice(0, 5)}</span>
          </Row>
          {event.pastor && (
            <Row icon="🙏" label="Pastor">
              <span style={{ fontSize: 14, fontWeight: 600, color: '#101828' }}>{event.pastor}</span>
            </Row>
          )}
          {event.responsavel && (
            <Row icon="👤" label="Responsável">
              <span style={{ fontSize: 14, fontWeight: 600, color: '#101828' }}>{event.responsavel}</span>
            </Row>
          )}
          {event.adoracao && (event.adoracao.responsavel || event.adoracao.membros?.length > 0) && (
            <Row icon="🎵" label="Adoração">
              {event.adoracao.responsavel && <div style={{ fontSize: 14, color: '#101828', fontWeight: 500 }}>{event.adoracao.responsavel}</div>}
              {event.adoracao.membros?.length > 0 && <Tags items={event.adoracao.membros} />}
            </Row>
          )}
          {event.organizacao && (event.organizacao.responsavel || event.organizacao.membros?.length > 0) && (
            <Row icon="📋" label="Organização">
              {event.organizacao.responsavel && <div style={{ fontSize: 14, color: '#101828', fontWeight: 500 }}>{event.organizacao.responsavel}</div>}
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

          {/* Auditoria */}
          {(auditCriado || auditAtualizado) && (
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#F7F9FC', borderRadius: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Auditoria</div>
              {auditCriado && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: auditAtualizado ? 6 : 0 }}>
                  <span style={{ fontSize: 12 }}>🟢</span>
                  <span style={{ fontSize: 12, color: '#374151' }}>
                    Criado por <strong>{auditCriado.usuario_nome}</strong> · {fmtTs(auditCriado.criado_em)}
                  </span>
                </div>
              )}
              {auditAtualizado && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12 }}>✏️</span>
                  <span style={{ fontSize: 12, color: '#374151' }}>
                    Última edição por <strong>{auditAtualizado.usuario_nome}</strong> · {fmtTs(auditAtualizado.criado_em)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 22px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onDelete} style={{ padding: '7px 14px', background: '#FBEAF0', color: '#993556', border: 'none', fontSize: 13, fontWeight: 400, borderRadius: 6, cursor: 'pointer' }}>🗑️ Excluir</button>
          <button onClick={onEdit} style={{ padding: '7px 18px', background: '#2E5AAC', color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, borderRadius: 6, cursor: 'pointer' }}>✏️ Editar</button>
        </div>
      </div>
    </div>
  );
}
