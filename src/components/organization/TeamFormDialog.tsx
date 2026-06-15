'use client';
import { useState } from 'react';
import { Team, Person, EventColor } from '@/types';
import { COLORS, getColor } from '@/lib/colors';

type TForm = Omit<Team, 'id'>;

function defForm(): TForm {
  return { nome: '', descricao: '', cor: 'azul', liderId: '', membroIds: [] };
}

type Props = {
  editTeam?: Team | null;
  people: Person[];
  onClose: () => void;
  onSave: (data: TForm) => void;
  onDelete?: (id: string) => void;
};

export function TeamFormDialog({ editTeam, people, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<TForm>(() => editTeam ? { ...editTeam, membroIds: [...(editTeam.membroIds ?? [])] } : defForm());
  const isEdit = !!editTeam;

  const upd = (k: keyof TForm, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const toggleMember = (pid: string) => setForm(f => ({
    ...f,
    membroIds: f.membroIds.includes(pid) ? f.membroIds.filter(x => x !== pid) : [...f.membroIds, pid],
  }));

  const activePeople = people.filter(p => p.ativo);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(16,24,40,0.35)', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 48px rgba(16,24,40,0.16)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#101828' }}>{isEdit ? 'Editar Equipe' : 'Nova Equipe'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#9AA3B5' }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nome da equipe <span style={{ color: '#D4537E' }}>*</span></label>
            <input value={form.nome} onChange={e => upd('nome', e.target.value)} placeholder="Ex.: Equipe de Louvor" style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Descrição</label>
            <textarea value={form.descricao ?? ''} onChange={e => upd('descricao', e.target.value)} rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Cor</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(cor => {
                const cl = getColor(cor), sel = form.cor === cor;
                return <button key={cor} title={cor} onClick={() => upd('cor', cor)} style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${sel ? cl.dot : 'transparent'}`, background: cl.dot, cursor: 'pointer', outline: sel ? `2px solid ${cl.dot}` : 'none', outlineOffset: 2, padding: 0 }} />;
              })}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Líder</label>
            <select value={form.liderId ?? ''} onChange={e => upd('liderId', e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', background: '#fff' }}>
              <option value="">Selecionar líder...</option>
              {activePeople.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Membros</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 200, overflowY: 'auto' }}>
              {activePeople.map(p => {
                const isIn = form.membroIds.includes(p.id);
                return (
                  <div key={p.id} onClick={() => toggleMember(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: isIn ? '#E6F1FB' : '#F7F9FC', cursor: 'pointer', transition: 'background 0.1s' }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${isIn ? '#2E5AAC' : '#D1D5DB'}`, background: isIn ? '#2E5AAC' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.1s' }}>
                      {isIn && <span style={{ color: '#fff', fontSize: 12, lineHeight: 1, fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 14, color: '#101828', fontWeight: isIn ? 500 : 400 }}>{p.nome}</span>
                    {p.funcoes.length > 0 && <span style={{ fontSize: 12, color: '#9AA3B5', marginLeft: 'auto' }}>{p.funcoes[0]}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', background: '#fff', border: '1px solid #D1D5DB', color: '#374151', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: 'pointer' }}>Cancelar</button>
          {isEdit && onDelete && editTeam && (
            <button onClick={() => { onDelete(editTeam.id); onClose(); }} style={{ padding: '8px 18px', background: '#FBEAF0', color: '#993556', border: 'none', fontSize: 13, fontWeight: 600, borderRadius: 10, cursor: 'pointer' }}>Excluir</button>
          )}
          <button onClick={() => form.nome && onSave(form)} disabled={!form.nome} style={{ padding: '8px 24px', background: form.nome ? '#2E5AAC' : '#BBD3F0', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: form.nome ? 'pointer' : 'not-allowed' }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
