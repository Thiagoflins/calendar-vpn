'use client';
import { useState } from 'react';
import { Person, Availability } from '@/types';
import { useAvailabilityByPerson, useCreateAvailability, useRemoveAvailability } from '@/hooks/useAvailability';

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  person: Person;
  onClose: () => void;
};

export function IndisponibilidadeDialog({ person, onClose }: Props) {
  const { data: records = [], isLoading } = useAvailabilityByPerson(person.id);
  const createAvailability = useCreateAvailability();
  const removeAvailability = useRemoveAvailability();

  const [inicio, setInicio] = useState(today());
  const [fim, setFim] = useState(today());
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sorted = [...records].sort((a, b) => a.dataInicio.localeCompare(b.dataInicio));
  const upcoming = sorted.filter(r => r.dataFim >= today());
  const past = sorted.filter(r => r.dataFim < today());

  async function handleAdd() {
    if (fim < inicio) { setError('A data de fim não pode ser anterior ao início.'); return; }
    setSaving(true);
    setError(null);
    try {
      await createAvailability.mutateAsync({ pessoaId: person.id, dataInicio: inicio, dataFim: fim, motivo: motivo.trim() || undefined });
      setMotivo('');
      setInicio(today());
      setFim(today());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  function initials(nome: string) {
    return nome.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(16,24,40,0.45)', backdropFilter: 'blur(5px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(16,24,40,0.18)' }}>

        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#1C3568', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
            {initials(person.nome)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#101828' }}>{person.nome}</div>
            <div style={{ fontSize: 12, color: '#9AA3B5', marginTop: 1 }}>Gerenciar indisponibilidades</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280', borderRadius: 8 }}>×</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {/* Adicionar novo período */}
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #F5F5F5' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Novo período</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 4 }}>De</label>
                <input type="date" value={inicio} onChange={e => setInicio(e.target.value)}
                  style={{ width: '100%', height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box', color: '#101828' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Até</label>
                <input type="date" value={fim} onChange={e => setFim(e.target.value)}
                  style={{ width: '100%', height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box', color: '#101828' }} />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Motivo (opcional)</label>
              <input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ex.: viagem, doença..."
                style={{ width: '100%', height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box', color: '#101828' }} />
            </div>
            {error && <div style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', padding: '6px 10px', borderRadius: 6, marginBottom: 8 }}>{error}</div>}
            <button onClick={handleAdd} disabled={saving}
              style={{ width: '100%', height: 36, borderRadius: 8, border: 'none', background: saving ? '#BBD3F0' : '#2E5AAC', color: '#fff', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Salvando...' : '+ Adicionar período'}
            </button>
          </div>

          {/* Lista de períodos */}
          <div style={{ padding: '14px 22px' }}>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#9AA3B5', fontSize: 13 }}>Carregando...</div>
            ) : records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>📅</div>
                <div style={{ fontSize: 13, color: '#9AA3B5' }}>Nenhuma indisponibilidade cadastrada</div>
              </div>
            ) : (
              <>
                {upcoming.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Próximos / em vigor</div>
                    {upcoming.map(r => <RecordRow key={r.id} record={r} onRemove={() => removeAvailability.mutate(r.id)} />)}
                  </div>
                )}
                {past.length > 0 && (
                  <div style={{ marginTop: upcoming.length > 0 ? 14 : 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#C4C9D4', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Anteriores</div>
                    {past.map(r => <RecordRow key={r.id} record={r} onRemove={() => removeAvailability.mutate(r.id)} faded />)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordRow({ record, onRemove, faded = false }: { record: Availability; onRemove: () => void; faded?: boolean }) {
  const same = record.dataInicio === record.dataFim;
  const label = same
    ? fmtDate(record.dataInicio)
    : `${fmtDate(record.dataInicio)} → ${fmtDate(record.dataFim)}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #F5F5F5', opacity: faded ? 0.5 : 1 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: faded ? '#C4C9D4' : '#F59E0B', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#101828' }}>{label}</div>
        {record.motivo && <div style={{ fontSize: 12, color: '#9AA3B5', marginTop: 1 }}>{record.motivo}</div>}
      </div>
      <button onClick={onRemove} title="Remover"
        style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', color: '#C4C9D4', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#C4C9D4'; }}
      >×</button>
    </div>
  );
}
