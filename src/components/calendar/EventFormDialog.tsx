'use client';
import { useState, useEffect } from 'react';
import { CalendarEvent, EventColor, EventType, RecurrenceType } from '@/types';
import { COLORS, getColor } from '@/lib/colors';

type EForm = {
  nome: string; descricao: string; data: string; hora: string; cor: EventColor;
  pastor: string; responsavel: string; observacao: string;
  adoracaoResp: string; adoracaoEquipe: string[];
  orgResp: string; orgEquipe: string[];
  equipe: string[];
  repetir: RecurrenceType; repetirQtd: number;
};

function defForm(): EForm {
  return { nome: '', descricao: '', data: '', hora: '', cor: 'azul', pastor: '', responsavel: '', observacao: '', adoracaoResp: '', adoracaoEquipe: [''], orgResp: '', orgEquipe: [''], equipe: [''], repetir: 'nenhuma', repetirQtd: 4 };
}

type Props = {
  eventType: EventType;
  editEvent?: CalendarEvent | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: (data: Omit<CalendarEvent, 'id'>, repetirQtd: number) => void;
  onDelete?: (id: string) => void;
};

export function EventFormDialog({ eventType, editEvent, defaultDate, onClose, onSave, onDelete }: Props) {
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
      f.adoracaoEquipe = editEvent.adoracao?.membros?.length ? [...editEvent.adoracao.membros, ''] : [''];
      f.orgResp = editEvent.organizacao?.responsavel ?? '';
      f.orgEquipe = editEvent.organizacao?.membros?.length ? [...editEvent.organizacao.membros, ''] : [''];
      f.equipe = editEvent.equipe?.length ? [...editEvent.equipe, ''] : [''];
    }
    return f;
  });

  const isEdit = !!editEvent;
  const isCulto = eventType === 'culto';
  const title = isEdit ? (isCulto ? 'Editar Culto' : 'Editar Atividade') : (isCulto ? 'Novo Culto' : 'Nova Atividade');
  const canSave = !!(form.nome && form.data && form.hora);
  const saveLbl = form.repetir !== 'nenhuma' && !isEdit ? `Salvar (${form.repetirQtd}×)` : 'Salvar';

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

  const handleSave = () => {
    if (!canSave) return;
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

  const REC_OPTS: { v: RecurrenceType; l: string }[] = [{ v: 'nenhuma', l: 'Não repetir' }, { v: 'semanal', l: 'Semanal' }, { v: 'quinzenal', l: 'Quinzenal' }, { v: 'mensal', l: 'Mensal' }];

  return (
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

          {isCulto && fld('Pastor', inp(form.pastor, v => upd('pastor', v), { placeholder: 'Nome do pastor' }))}
          {!isCulto && fld('Responsável', inp(form.responsavel, v => upd('responsavel', v), { placeholder: 'Nome do responsável' }))}

          {isCulto && sec('🎵 Adoração', <>
            {fld('Responsável', inp(form.adoracaoResp, v => upd('adoracaoResp', v), { placeholder: 'Responsável pela adoração' }))}
            <EquipeField field="adoracaoEquipe" label="Equipe" />
          </>)}

          {isCulto && sec('📋 Organização do Culto', <>
            {fld('Responsável', inp(form.orgResp, v => upd('orgResp', v), { placeholder: 'Responsável pela organização' }))}
            <EquipeField field="orgEquipe" label="Equipe" />
          </>)}

          {!isCulto && sec('👥 Equipe', <EquipeField field="equipe" label="Membros" />)}

          {fld('Observação', ta(form.observacao, v => upd('observacao', v)))}

          {sec('🔁 Repetição', <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: form.repetir !== 'nenhuma' ? 12 : 0 }}>
              {REC_OPTS.map(o => (
                <button key={o.v} onClick={() => upd('repetir', o.v)} style={{ padding: '6px 14px', borderRadius: 999, border: '1px solid', borderColor: form.repetir === o.v ? '#2E5AAC' : '#E5E7EB', background: form.repetir === o.v ? '#E6F1FB' : '#fff', color: form.repetir === o.v ? '#2E5AAC' : '#6B7280', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{o.l}</button>
              ))}
            </div>
            {form.repetir !== 'nenhuma' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>Repetir por</label>
                <input type="number" value={form.repetirQtd} onChange={e => upd('repetirQtd', Math.max(2, parseInt(e.target.value) || 2))} style={{ width: 80, height: 40, padding: '0 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} />
                <span style={{ fontSize: 13, color: '#6B7280' }}>vezes</span>
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
  );
}
