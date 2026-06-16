'use client';
import { useState, useRef, useEffect } from 'react';
import { Person } from '@/types';

type PForm = Omit<Person, 'id'>;

function defForm(): PForm {
  return { nome: '', email: '', telefone: '', funcoes: [], equipeIds: [], ativo: true, observacao: '' };
}

type Props = {
  editPerson?: Person | null;
  funcoes?: string[];
  onClose: () => void;
  onSave: (data: PForm) => void;
};

export function PersonFormDialog({ editPerson, funcoes = [], onClose, onSave }: Props) {
  const [form, setForm] = useState<PForm>(() => editPerson ? { ...editPerson } : defForm());
  const [fnOpen, setFnOpen] = useState(false);
  const [fnSearch, setFnSearch] = useState('');
  const fnRef = useRef<HTMLDivElement>(null);
  const isEdit = !!editPerson;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (fnRef.current && !fnRef.current.contains(e.target as Node)) {
        setFnOpen(false); setFnSearch('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const upd = (k: keyof PForm, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const toggleFn = (fn: string) => setForm(f => ({
    ...f,
    funcoes: f.funcoes.includes(fn) ? f.funcoes.filter(x => x !== fn) : [...f.funcoes, fn],
  }));

  const filteredFuncoes = funcoes.filter(fn =>
    fn.toLowerCase().includes(fnSearch.toLowerCase())
  );

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

          <div style={{ marginBottom: 14 }} ref={fnRef}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Funções</label>

            {/* Chips das selecionadas */}
            {form.funcoes.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                {form.funcoes.map(fn => (
                  <div key={fn} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px 3px 10px', borderRadius: 999, background: '#EEF2FF', border: '1px solid #C7D7F5' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#2E5AAC' }}>{fn}</span>
                    <button
                      onMouseDown={e => { e.preventDefault(); toggleFn(fn); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B9BD4', fontSize: 15, padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Input com dropdown */}
            <div style={{ position: 'relative' }}>
              <input
                value={fnSearch}
                onChange={e => { setFnSearch(e.target.value); setFnOpen(true); }}
                onFocus={() => setFnOpen(true)}
                placeholder={form.funcoes.length === 0 ? 'Buscar e selecionar funções...' : 'Adicionar mais...'}
                style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 10, border: `1px solid ${fnOpen ? '#2E5AAC' : '#D1D5DB'}`, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              />

              {fnOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 400, background: '#fff', borderRadius: 10, boxShadow: '0 8px 24px rgba(16,24,40,0.13)', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {filteredFuncoes.length === 0 ? (
                      <div style={{ padding: '14px 12px', textAlign: 'center', color: '#9AA3B5', fontSize: 13 }}>Nenhuma função encontrada</div>
                    ) : filteredFuncoes.map((fn, i) => {
                      const sel = form.funcoes.includes(fn);
                      return (
                        <div
                          key={fn}
                          onMouseDown={e => { e.preventDefault(); toggleFn(fn); setFnSearch(''); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: sel ? '#EEF2FF' : i % 2 === 0 ? '#fff' : '#FAFBFC', cursor: 'pointer', borderBottom: i < filteredFuncoes.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                        >
                          <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${sel ? '#2E5AAC' : '#D1D5DB'}`, background: sel ? '#2E5AAC' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {sel && <span style={{ color: '#fff', fontSize: 10, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: sel ? 600 : 400, color: '#101828' }}>{fn}</span>
                        </div>
                      );
                    })}
                  </div>
                  {form.funcoes.length > 0 && (
                    <div style={{ padding: '7px 12px', borderTop: '1px solid #F3F4F6', background: '#FAFBFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>{form.funcoes.length} selecionada{form.funcoes.length !== 1 ? 's' : ''}</span>
                      <button onMouseDown={e => { e.preventDefault(); setFnOpen(false); }} style={{ fontSize: 12, fontWeight: 600, color: '#2E5AAC', background: 'none', border: 'none', cursor: 'pointer' }}>Concluir</button>
                    </div>
                  )}
                </div>
              )}
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
