'use client';
import { useState } from 'react';

const DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const DIAS_FULL = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export type CustomRecConfig = {
  interval: number;
  unit: 'dia' | 'semana' | 'mes';
  weekDays: number[];       // 0=Dom … 6=Sáb (só quando unit='semana')
  endType: 'nunca' | 'em' | 'apos';
  endDate: string;
  endCount: number;
};

type Props = {
  baseDate: string;
  onClose: () => void;
  onConfirm: (config: CustomRecConfig) => void;
};

function dayOfWeek(ds: string) {
  const [y, mo, d] = ds.split('-').map(Number);
  return new Date(y, mo - 1, d).getDay();
}

export function CustomRecurrenceDialog({ baseDate, onClose, onConfirm }: Props) {
  const baseDow = baseDate ? dayOfWeek(baseDate) : 1;

  const [interval, setInterval] = useState(1);
  const [unit, setUnit] = useState<'dia' | 'semana' | 'mes'>('semana');
  const [weekDays, setWeekDays] = useState<number[]>([baseDow]);
  const [endType, setEndType] = useState<'nunca' | 'em' | 'apos'>('apos');
  const [endDate, setEndDate] = useState('');
  const [endCount, setEndCount] = useState(13);

  function toggleDay(d: number) {
    setWeekDays(prev =>
      prev.includes(d) ? (prev.length > 1 ? prev.filter(x => x !== d) : prev) : [...prev, d]
    );
  }

  function summary() {
    const base = interval === 1
      ? (unit === 'dia' ? 'Diário' : unit === 'semana' ? 'Semanal' : 'Mensal')
      : `A cada ${interval} ${unit === 'dia' ? 'dias' : unit === 'semana' ? 'semanas' : 'meses'}`;

    if (unit === 'semana') {
      const sorted = [...weekDays].sort();
      const names = sorted.map(d => DIAS_FULL[d]).join(', ');
      return `${base}: ${names}`;
    }
    return base;
  }

  function handleConfirm() {
    onConfirm({ interval, unit, weekDays: unit === 'semana' ? weekDays : [], endType, endDate, endCount });
  }

  return (
    <div
      onClick={onClose}
      className="vpn-modal-bg"
      style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(16,24,40,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="vpn-modal"
        style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 440, boxShadow: '0 16px 48px rgba(16,24,40,0.18)', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#101828' }}>Recorrência personalizada</h2>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Repetir a cada */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: 8 }}>Repetir a cada</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number" min={1} max={99} value={interval}
                onChange={e => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: 72, height: 40, padding: '0 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 15, textAlign: 'center', outline: 'none' }}
              />
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as 'dia' | 'semana' | 'mes')}
                style={{ flex: 1, height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, color: '#101828', background: '#fff', outline: 'none', cursor: 'pointer' }}
              >
                <option value="dia">{interval === 1 ? 'dia' : 'dias'}</option>
                <option value="semana">{interval === 1 ? 'semana' : 'semanas'}</option>
                <option value="mes">{interval === 1 ? 'mês' : 'meses'}</option>
              </select>
            </div>
          </div>

          {/* Dias da semana */}
          {unit === 'semana' && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: 10 }}>Repetir em</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {DIAS.map((d, i) => {
                  const sel = weekDays.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      style={{
                        width: 38, height: 38, borderRadius: '50%', border: 'none',
                        background: sel ? '#2E5AAC' : '#F3F4F6',
                        color: sel ? '#fff' : '#6B7280',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >{d}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Termina em */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: 10 }}>Termina em</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Nunca */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="radio" checked={endType === 'nunca'} onChange={() => setEndType('nunca')} style={{ accentColor: '#2E5AAC', width: 16, height: 16 }} />
                <span style={{ fontSize: 14, color: '#111827' }}>Nunca</span>
              </label>

              {/* Em (data) */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="radio" checked={endType === 'em'} onChange={() => setEndType('em')} style={{ accentColor: '#2E5AAC', width: 16, height: 16 }} />
                <span style={{ fontSize: 14, color: '#111827', minWidth: 32 }}>Em</span>
                <input
                  type="date" value={endDate}
                  onChange={e => { setEndDate(e.target.value); setEndType('em'); }}
                  min={baseDate}
                  style={{ flex: 1, height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid', borderColor: endType === 'em' ? '#2E5AAC' : '#D1D5DB', fontSize: 13, outline: 'none', color: endType === 'em' ? '#111827' : '#9CA3AF', background: '#fff' }}
                />
              </label>

              {/* Após (ocorrências) */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="radio" checked={endType === 'apos'} onChange={() => setEndType('apos')} style={{ accentColor: '#2E5AAC', width: 16, height: 16 }} />
                <span style={{ fontSize: 14, color: '#111827', minWidth: 32 }}>Após</span>
                <input
                  type="number" min={1} max={365} value={endCount}
                  onChange={e => { setEndCount(Math.max(1, parseInt(e.target.value) || 1)); setEndType('apos'); }}
                  style={{ width: 64, height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid', borderColor: endType === 'apos' ? '#2E5AAC' : '#D1D5DB', fontSize: 14, textAlign: 'center', outline: 'none' }}
                />
                <span style={{ fontSize: 13, color: '#6B7280' }}>ocorrências</span>
              </label>

            </div>
          </div>

          {/* Resumo */}
          <div style={{ background: '#F0F5FF', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#2E5AAC', fontWeight: 500 }}>
            📅 {summary()}{endType === 'nunca' ? ' · sem data de término (máx. 1 ano)' : endType === 'em' && endDate ? ` · até ${new Date(endDate + 'T12:00:00').toLocaleDateString('pt-BR')}` : endType === 'apos' ? ` · ${endCount} ocorrências` : ''}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ padding: '9px 20px', background: '#fff', border: '1px solid #D1D5DB', color: '#374151', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: 'pointer' }}
          >Cancelar</button>
          <button
            onClick={handleConfirm}
            disabled={endType === 'em' && !endDate}
            style={{ padding: '9px 24px', background: endType === 'em' && !endDate ? '#BBD3F0' : '#2E5AAC', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: endType === 'em' && !endDate ? 'not-allowed' : 'pointer' }}
          >Concluir</button>
        </div>
      </div>
    </div>
  );
}
