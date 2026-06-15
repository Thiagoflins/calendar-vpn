'use client';
import { useState } from 'react';
import { Person } from '@/types';

const FNS = ['Pastor','Vocal','Teclado','Bateria','Baixo','Guitarra','Percussão','Violão','Mídia','Recepção','Pregador','Organização','Diaconato','Ujv'];

type PForm = Omit<Person, 'id'>;

function defForm(): PForm {
  return { nome: '', email: '', telefone: '', funcoes: [], equipeIds: [], ativo: true, observacao: '' };
}

type Props = {
  editPerson?: Person | null;
  onClose: () => void;
  onSave: (data: PForm) => void;
};

export function PersonFormDialog({ editPerson, onClose, onSave }: Props) {
  const [form, setForm] = useState<PForm>(() => editPerson ? { ...editPerson } : defForm());
  const isEdit = !!editPerson;

  const upd = (k: keyof PForm, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const toggleFn = (fn: string) => setForm(f => ({
    ...f,
    funcoes: f.funcoes.includes(fn) ? f.funcoes.filter(x => x !== fn) : [...f.funcoes, fn],
  }));

  const inp = (val: string, onChange: (v: string) => void, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input value={val} onChange={e => onChange(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} {...props} />
  );
  const fld = (label: string, el: React.ReactNode, req = false) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}{req && <span style={{ color: '#D4537E' }}>*</span>}</label>
      {el}
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(16,24,40,0.35)', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 48px rgba(16,24,40,0.16)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#101828' }}>{isEdit ? 'Editar Membro' : 'Novo Membro'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#9AA3B5' }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {fld('Nome completo', inp(form.nome, v => upd('nome', v), { placeholder: 'Nome completo' }), true)}
          {fld('E-mail', inp(form.email ?? '', v => upd('email', v), { type: 'email', placeholder: 'email@exemplo.com' }))}
          {fld('Telefone', inp(form.telefone ?? '', v => upd('telefone', v), { type: 'tel', placeholder: '(11) 99999-0000' }))}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Funções</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {FNS.map(fn => {
                const on = form.funcoes.includes(fn);
                return (
                  <button key={fn} onClick={() => toggleFn(fn)} style={{ padding: '4px 12px', borderRadius: 999, border: '1px solid', borderColor: on ? '#2E5AAC' : '#E5E7EB', background: on ? '#E6F1FB' : '#fff', color: on ? '#2E5AAC' : '#6B7280', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.1s' }}>
                    {fn}
                  </button>
                );
              })}
            </div>
          </div>

          {fld('Observação',
            <textarea value={form.observacao ?? ''} onChange={e => upd('observacao', e.target.value)} rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#F7F9FC', borderRadius: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#101828' }}>Membro ativo</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Desative para marcar como inativo</div>
            </div>
            <button onClick={() => upd('ativo', !form.ativo)} style={{ width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2, background: form.ativo ? '#2E5AAC' : '#D1D5DB', transition: 'background 0.2s', position: 'relative' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, transition: 'left 0.2s', left: form.ativo ? 22 : 2 }} />
            </button>
          </div>
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', background: '#fff', border: '1px solid #D1D5DB', color: '#374151', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => form.nome && onSave(form)} disabled={!form.nome} style={{ padding: '8px 24px', background: form.nome ? '#2E5AAC' : '#BBD3F0', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: form.nome ? 'pointer' : 'not-allowed' }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
