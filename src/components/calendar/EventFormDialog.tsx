'use client';
import { useState } from 'react';
import { CalendarEvent, EventColor, EventType, RecurrenceType } from '@/types';
import { COLORS, getColor } from '@/lib/colors';
import { CustomRecurrenceDialog, CustomRecConfig } from './CustomRecurrenceDialog';
import { PessoaSelect } from '@/components/shared/PessoaSelect';
import { PessoaMultiSelect } from '@/components/shared/PessoaMultiSelect';
import { usePeople } from '@/hooks/usePeople';

type EForm = {
  nome: string; descricao: string; data: string; hora: string; cor: EventColor;
  pastor: string; responsavel: string; observacao: string;
  adoracaoResp: string; adoracaoEquipe: string[];
  orgResp: string; orgEquipe: string[];
  equipe: string[];
  repetir: RecurrenceType; repetirQtd: number;
};

function defForm(): EForm {
  return { nome: '', descricao: '', data: '', hora: '', cor: 'azul', pastor: '', responsavel: '', observacao: '', adoracaoResp: '', adoracaoEquipe: [''], orgResp: '', orgEquipe: [''], equipe: [''], repetir: 'nenhuma', repetirQtd: 8 };
}

type Props = {
  eventType: EventType;
  editEvent?: CalendarEvent | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: (data: Omit<CalendarEvent, 'id'>, repetirQtd: number) => void;
  onSaveCustom?: (events: Omit<CalendarEvent, 'id'>[]) => void;
  onDelete?: (id: string) => void;
};

function fdDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function computeCustomDates(data: string, cfg: CustomRecConfig): string[] {
  const [y, mo, d] = data.split('-').map(Number);
  const start = new Date(y, mo - 1, d);

  let endDate: Date | null = null;
  let maxCount = 9999;
  if (cfg.endType === 'em' && cfg.endDate) {
    endDate = new Date(cfg.endDate + 'T23:59:59');
  } else if (cfg.endType === 'nunca') {
    endDate = new Date(y, mo - 1 + 12, d);
  } else if (cfg.endType === 'apos') {
    maxCount = cfg.endCount;
  }

  const dates: string[] = [];

  function tryAdd(dt: Date): 'added' | 'skip' | 'stop' {
    if (endDate && dt > endDate) return 'stop';
    if (dates.length >= maxCount) return 'stop';
    if (dt < start) return 'skip';
    dates.push(fdDate(dt));
    return 'added';
  }

  if (cfg.unit === 'dia') {
    let cur = new Date(start);
    while (true) {
      const res = tryAdd(cur);
      if (res === 'stop') break;
      const nxt = new Date(cur); nxt.setDate(nxt.getDate() + cfg.interval); cur = nxt;
    }
  } else if (cfg.unit === 'semana') {
    const baseMon = new Date(start);
    const dow0 = baseMon.getDay();
    baseMon.setDate(baseMon.getDate() - (dow0 === 0 ? 6 : dow0 - 1));
    outer: for (let wk = 0; wk < 300; wk++) {
      if (wk % cfg.interval !== 0) continue;
      for (const dow of [...cfg.weekDays].sort()) {
        const offset = dow === 0 ? 6 : dow - 1;
        const date = new Date(baseMon);
        date.setDate(baseMon.getDate() + wk * 7 + offset);
        if (tryAdd(date) === 'stop') break outer;
      }
    }
  } else {
    let cur = new Date(start);
    while (true) {
      const res = tryAdd(cur);
      if (res === 'stop') break;
      const nxt = new Date(cur); nxt.setMonth(nxt.getMonth() + cfg.interval); cur = nxt;
    }
  }

  return dates;
}

export function EventFormDialog({ eventType, editEvent, defaultDate, onClose, onSave, onSaveCustom, onDelete }: Props) {
  const [form, setForm] = useState<EForm>(() => {
    const f = defForm();
    if (defaultDate) f.data = defaultDate;
    if (editEvent) {
      f.nome = editEvent.nome ?? '';
      f.descricao = editEvent.descricao ?? '';
      f.data = editEvent.data ?? '';
      f.hora = editEvent.hora ?? '';
      f.cor = editEvent.cor ?? 'azul';
      f.pastor = editEvent.pastor ?? '';
      f.responsavel = editEvent.responsavel ?? '';
      f.observacao = editEvent.observacao ?? '';
      f.adoracaoResp = editEvent.adoracao?.responsavel ?? '';
      f.adoracaoEquipe = editEvent.adoracao?.membros ?? [];
      f.orgResp = editEvent.organizacao?.responsavel ?? '';
      f.orgEquipe = editEvent.organizacao?.membros ?? [];
      f.equipe = editEvent.equipe ?? [];
    }
    return f;
  });

  const { data: people = [] } = usePeople();
  const activePeople = people.filter(p => p.ativo);

  const [isCustom, setIsCustom] = useState(false);
  const [customCfg, setCustomCfg] = useState<CustomRecConfig | null>(null);
  const [showCustomDlg, setShowCustomDlg] = useState(false);

  const customDates = isCustom && customCfg && form.data ? computeCustomDates(form.data, customCfg) : null;
  const customCount = customDates?.length ?? 0;

  const isEdit = !!editEvent;
  const isCulto = eventType === 'culto';
  const title = isEdit ? (isCulto ? 'Editar Culto' : 'Editar Atividade') : (isCulto ? 'Novo Culto' : 'Nova Atividade');
  const canSave = !!(form.nome && form.data && form.hora);
  const saveLbl = isCustom && !isEdit ? `Salvar (${customCount} eventos)` : form.repetir !== 'nenhuma' && !isEdit ? `Salvar (${form.repetirQtd}×)` : 'Salvar';

  const upd = (k: keyof EForm, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const updMember = (field: 'adoracaoEquipe' | 'orgEquipe' | 'equipe', i: number, v: string) => {
    setForm(f => { const a = [...f[field]]; a[i] = v; return { ...f, [field]: a }; });
  };
  const addMember = (field: 'adoracaoEquipe' | 'orgEquipe' | 'equipe') => {
    setForm(f => ({ ...f, [field]: [...f[field], ''] }));
  };
  const remMember = (field: 'adoracaoEquipe' | 'orgEquipe' | 'equipe', i: number) => {
    setForm(f => ({ ...f, [field]: f[field].filter((_, j) => j !== i) }));
  };

  const handleRecChange = (v: string) => {
    if (v === 'personalizada') {
      setShowCustomDlg(true);
    } else {
      setIsCustom(false);
      setCustomCfg(null);
      upd('repetir', v as RecurrenceType);
    }
  };

  const handleCustomClose = () => {
    setShowCustomDlg(false);
    if (!customCfg) setIsCustom(false);
  };

  const handleCustomConfirm = (cfg: CustomRecConfig) => {
    setCustomCfg(cfg);
    setIsCustom(true);
    setShowCustomDlg(false);
  };

  const buildBase = (): Omit<CalendarEvent, 'id'> => {
    const b: Omit<CalendarEvent, 'id'> = { type: eventType, nome: form.nome, data: form.data, hora: form.hora, cor: form.cor };
    if (form.descricao) b.descricao = form.descricao;
    if (form.observacao) b.observacao = form.observacao;
    if (isCulto) {
      if (form.pastor) b.pastor = form.pastor;
      const am = form.adoracaoEquipe.filter(x => x.trim());
      if (form.adoracaoResp || am.length) b.adoracao = { responsavel: form.adoracaoResp, membros: am };
      const om = form.orgEquipe.filter(x => x.trim());
      if (form.orgResp || om.length) b.organizacao = { responsavel: form.orgResp, membros: om };
    } else {
      if (form.responsavel) b.responsavel = form.responsavel;
      const eq = form.equipe.filter(x => x.trim());
      if (eq.length) b.equipe = eq;
    }
    return b;
  };

  const handleSave = () => {
    if (!canSave) return;
    const b = buildBase();
    if (isCustom && customCfg && !isEdit && onSaveCustom) {
      const events = computeCustomDates(form.data, customCfg).map(data => ({ ...b, data, repetir: 'nenhuma' as RecurrenceType }));
      onSaveCustom(events);
      return;
    }
    if (!isEdit) b.repetir = form.repetir;
    onSave(b, form.repetirQtd);
  };

  const inp = (val: string, onChange: (v: string) => void, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input value={val} onChange={e => onChange(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} {...props} />
  );
  const ta = (val: string, onChange: (v: string) => void) => (
    <textarea value={val} onChange={e => onChange(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box', resize: 'vertical' }} />
  );
  const fld = (label: string, el: React.ReactNode, req = false) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}{req && <span style={{ color: '#D4537E', marginLeft: 2 }}>*</span>}</label>
      {el}
    </div>
  );
  const sec = (title: string, children: React.ReactNode) => (
    <div style={{ background: '#F7F9FC', borderRadius: 12, padding: 16, marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#101828', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );

  const EquipeField = ({ field, label }: { field: 'adoracaoEquipe' | 'orgEquipe' | 'equipe'; label: string }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{label}</div>
      {form[field].map((v, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={v} onChange={e => updMember(field, i, e.target.value)} placeholder={`Membro ${i+1}`} style={{ flex: 1, height: 40, padding: '0 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} />
          <button onClick={() => remMember(field, i)} style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid #FBEAF0', background: '#FBEAF0', color: '#993556', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>🗑️</button>
        </div>
      ))}
      <button onClick={() => addMember(field)} style={{ background: 'none', border: '1px dashed #BBD3F0', borderRadius: 10, color: '#2E5AAC', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '7px 14px', width: '100%' }}>+ Adicionar membro</button>
    </div>
  );

  const DIAS_PT = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

  function recDia(data: string) {
    if (!data) return '';
    const [y, mo, d] = data.split('-').map(Number);
    return DIAS_PT[new Date(y, mo - 1, d).getDay()];
  }

  function recDiaNum(data: string) {
    return data ? Number(data.split('-')[2]) : 0;
  }

  function recLabel(tipo: RecurrenceType): string {
    const dia = recDia(form.data);
    const num = recDiaNum(form.data);
    if (tipo === 'nenhuma') return 'Não se repete';
    if (tipo === 'semanal') return dia ? `Semanal: cada ${dia}` : 'Semanal';
    if (tipo === 'quinzenal') return dia ? `A cada 2 semanas: cada ${dia}` : 'A cada 2 semanas';
    return num ? `Mensal: todo dia ${num}` : 'Mensal';
  }

  function recUnidade(tipo: RecurrenceType): string {
    if (tipo === 'semanal') return 'semanas';
    if (tipo === 'quinzenal') return 'quinzenas';
    return 'meses';
  }

  function recPreview(tipo: RecurrenceType, data: string, qtd: number): string {
    if (tipo === 'nenhuma' || !data) return '';
    const step = tipo === 'semanal' ? 7 : tipo === 'quinzenal' ? 14 : 30;
    const [y, mo, d] = data.split('-').map(Number);
    const fim = new Date(y, mo - 1, d);
    fim.setDate(fim.getDate() + step * (qtd - 1));
    const fimStr = fim.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${qtd} eventos · até ${fimStr}`;
  }

  function customPreview(): string {
    if (!customDates || customDates.length === 0) return 'Nenhum evento';
    const last = customDates[customDates.length - 1];
    const [y, mo, d] = last.split('-').map(Number);
    const lastStr = new Date(y, mo - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${customDates.length} eventos · até ${lastStr}`;
  }

  const REC_TYPES: RecurrenceType[] = ['nenhuma', 'semanal', 'quinzenal', 'mensal'];
  const selectVal = isCustom ? 'personalizada' : form.repetir;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(16,24,40,0.35)', backdropFilter: 'blur(4px)' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 48px rgba(16,24,40,0.16)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#101828' }}>{title}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#9AA3B5' }}>×</button>
          </div>

          <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
            {fld('Nome do evento', inp(form.nome, v => upd('nome', v), { placeholder: isCulto ? 'Ex.: Culto Dominical' : 'Ex.: Reunião de Jovens' }), true)}
            {fld('Descrição', ta(form.descricao, v => upd('descricao', v)))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Data <span style={{ color: '#D4537E' }}>*</span></label>
                {inp(form.data, v => upd('data', v), { type: 'date' })}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Horário <span style={{ color: '#D4537E' }}>*</span></label>
                {inp(form.hora, v => upd('hora', v), { type: 'time' })}
              </div>
            </div>

            {fld('Cor do card',
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map(cor => {
                  const cl = getColor(cor), sel = form.cor === cor;
                  return <button key={cor} title={cor} onClick={() => upd('cor', cor)} style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${sel ? cl.dot : 'transparent'}`, background: cl.dot, cursor: 'pointer', outline: sel ? `2px solid ${cl.dot}` : 'none', outlineOffset: 2, padding: 0, transition: 'all 0.15s' }} />;
                })}
              </div>
            )}

            {isCulto && fld('Pastor', <PessoaSelect value={form.pastor} onChange={v => upd('pastor', v)} people={activePeople} placeholder="Buscar pastor..." />)}
            {!isCulto && fld('Responsável', <PessoaSelect value={form.responsavel} onChange={v => upd('responsavel', v)} people={activePeople} placeholder="Buscar responsável..." />)}

            {isCulto && sec('🎵 Adoração', <>
              {fld('Responsável', <PessoaSelect value={form.adoracaoResp} onChange={v => upd('adoracaoResp', v)} people={activePeople} placeholder="Buscar responsável pela adoração..." />)}
              {fld('Equipe', <PessoaMultiSelect values={form.adoracaoEquipe.filter(Boolean)} onChange={v => upd('adoracaoEquipe', v)} people={activePeople} placeholder="Adicionar membro da adoração..." />)}
            </>)}

            {isCulto && sec('📋 Organização do Culto', <>
              {fld('Responsável', <PessoaSelect value={form.orgResp} onChange={v => upd('orgResp', v)} people={activePeople} placeholder="Buscar responsável pela organização..." />)}
              {fld('Equipe', <PessoaMultiSelect values={form.orgEquipe.filter(Boolean)} onChange={v => upd('orgEquipe', v)} people={activePeople} placeholder="Adicionar membro da organização..." />)}
            </>)}

            {!isCulto && sec('👥 Equipe', fld('Membros', <PessoaMultiSelect values={form.equipe.filter(Boolean)} onChange={v => upd('equipe', v)} people={activePeople} placeholder="Adicionar membro..." />))}

            {fld('Observação', ta(form.observacao, v => upd('observacao', v)))}

            {sec('🔁 Repetição', <>
              {!form.data && (
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>
                  Selecione uma data para configurar a repetição.
                </div>
              )}
              <select
                key={form.data}
                value={selectVal}
                disabled={!form.data}
                onChange={e => handleRecChange(e.target.value)}
                style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, color: form.data ? '#101828' : '#9CA3AF', background: form.data ? '#fff' : '#F9FAFB', outline: 'none', cursor: form.data ? 'pointer' : 'not-allowed', marginBottom: (selectVal !== 'nenhuma') ? 12 : 0 }}
              >
                {REC_TYPES.map(t => (
                  <option key={t} value={t}>{recLabel(t)}</option>
                ))}
                <option value="personalizada">
                  {isCustom ? '⚙️ Personalizado (editar...)' : '⚙️ Personalizar...'}
                </option>
              </select>

              {/* Custom recurrence preview */}
              {isCustom && customCfg && form.data && (
                <div>
                  <div style={{ fontSize: 12, color: '#2E5AAC', background: '#E6F1FB', borderRadius: 8, padding: '7px 12px', marginBottom: 8 }}>
                    📅 {customPreview()}
                  </div>
                  <button
                    onClick={() => setShowCustomDlg(true)}
                    style={{ background: 'none', border: '1px dashed #BBD3F0', borderRadius: 8, color: '#2E5AAC', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '5px 12px' }}
                  >Editar recorrência</button>
                </div>
              )}

              {/* Standard recurrence controls */}
              {!isCustom && form.repetir !== 'nenhuma' && form.data && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <label style={{ fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>Repetir por</label>
                    <input
                      type="number" min={2} max={104}
                      value={form.repetirQtd}
                      onChange={e => upd('repetirQtd', Math.max(2, Math.min(104, parseInt(e.target.value) || 2)))}
                      style={{ width: 68, height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: 13, color: '#6B7280' }}>{recUnidade(form.repetir)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#2E5AAC', background: '#E6F1FB', borderRadius: 8, padding: '7px 12px' }}>
                    📅 {recPreview(form.repetir, form.data, form.repetirQtd)}
                  </div>
                </div>
              )}
            </>)}
          </div>

          <div style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '8px 20px', background: '#fff', border: '1px solid #D1D5DB', color: '#374151', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: 'pointer' }}>Cancelar</button>
            {isEdit && onDelete && editEvent && (
              <button onClick={() => onDelete(editEvent.id)} style={{ padding: '8px 18px', background: '#FBEAF0', color: '#993556', border: 'none', fontSize: 13, fontWeight: 600, borderRadius: 10, cursor: 'pointer' }}>Excluir</button>
            )}
            <button onClick={handleSave} disabled={!canSave} style={{ padding: '8px 24px', background: canSave ? '#2E5AAC' : '#BBD3F0', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: canSave ? 'pointer' : 'not-allowed' }}>{saveLbl}</button>
          </div>
        </div>
      </div>

      {showCustomDlg && (
        <CustomRecurrenceDialog
          baseDate={form.data}
          onClose={handleCustomClose}
          onConfirm={handleCustomConfirm}
        />
      )}
    </>
  );
}
