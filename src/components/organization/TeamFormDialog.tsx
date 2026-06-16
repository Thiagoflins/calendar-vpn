'use client';
import { useState, type ReactNode } from 'react';
import { Team, Person } from '@/types';
import { COLORS, getColor } from '@/lib/colors';
import { PessoaSelect } from '@/components/shared/PessoaSelect';
import { PessoaMultiSelect } from '@/components/shared/PessoaMultiSelect';

type TForm = Omit<Team, 'id'>;

function defForm(): TForm {
  return { nome: '', descricao: '', cor: 'azul', liderId: '', membroIds: [] };
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
}

type Props = {
  editTeam?: Team | null;
  people: Person[];
  onClose: () => void;
  onSave: (data: TForm) => void;
  onDelete?: (id: string) => void;
};

export function TeamFormDialog({ editTeam, people, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<TForm>(() =>
    editTeam ? { ...editTeam, membroIds: [...(editTeam.membroIds ?? [])] } : defForm()
  );
  const isEdit = !!editTeam;
  const cl = getColor(form.cor ?? 'azul');

  const upd = (k: keyof TForm, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const activePeople = people.filter(p => p.ativo);
  const lider = activePeople.find(p => p.id === form.liderId);

  const fld = (label: string, el: ReactNode, req = false) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}{req && <span style={{ color: '#D4537E', marginLeft: 2 }}>*</span>}
      </label>
      {el}
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(16,24,40,0.45)', backdropFilter: 'blur(5px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(16,24,40,0.18)' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: cl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: cl.dot }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#101828', lineHeight: 1.2 }}>
              {isEdit ? 'Editar Equipe' : 'Nova Equipe'}
            </h2>
            {isEdit && form.nome && (
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{form.nome}</div>
            )}
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280', borderRadius: 8 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>

          {fld('Nome da equipe', (
            <input
              value={form.nome}
              onChange={e => upd('nome', e.target.value)}
              placeholder="Ex.: Equipe de Louvor"
              style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
            />
          ), true)}
          {fld('Descrição', (
            <textarea
              value={form.descricao ?? ''}
              onChange={e => upd('descricao', e.target.value)}
              rows={2}
              placeholder="Descreva o propósito desta equipe..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit' }}
            />
          ))}

          {/* Cor */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Cor da equipe</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(cor => {
                const c = getColor(cor), sel = form.cor === cor;
                return (
                  <button
                    key={cor}
                    title={cor}
                    onClick={() => upd('cor', cor)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', border: `3px solid ${sel ? c.dot : 'transparent'}`,
                      background: c.dot, cursor: 'pointer', padding: 0,
                      boxShadow: sel ? `0 0 0 3px ${c.dot}40` : 'none',
                      transition: 'all 0.15s',
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Líder */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Líder</label>
            <PessoaSelect
              value={form.liderId ?? ''}
              onChange={v => upd('liderId', v)}
              people={activePeople}
              mode="id"
              placeholder="Buscar líder..."
            />
            {lider && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '6px 10px', background: cl.bg, borderRadius: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: cl.dot, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials(lider.nome)}</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: cl.text }}>{lider.nome}</span>
                {lider.funcoes[0] && <span style={{ fontSize: 12, color: cl.text, opacity: 0.7 }}>· {lider.funcoes[0]}</span>}
              </div>
            )}
          </div>

          {/* Membros */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Membros</label>
              {form.membroIds.length > 0 && (
                <span style={{ fontSize: 12, fontWeight: 600, color: cl.dot, background: cl.bg, padding: '2px 8px', borderRadius: 999 }}>
                  {form.membroIds.length} selecionado{form.membroIds.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <PessoaMultiSelect
              values={form.membroIds}
              onChange={v => upd('membroIds', v)}
              people={activePeople}
              mode="id"
              placeholder="Adicionar membro..."
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #F0F2F5', display: 'flex', gap: 8, justifyContent: 'flex-end', background: '#FAFBFC' }}>
          <button
            onClick={onClose}
            style={{ padding: '9px 20px', background: '#fff', border: '1px solid #D1D5DB', color: '#374151', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: 'pointer' }}
          >Cancelar</button>
          {isEdit && onDelete && editTeam && (
            <button
              onClick={() => { onDelete(editTeam.id); onClose(); }}
              style={{ padding: '9px 18px', background: '#FBEAF0', color: '#993556', border: 'none', fontSize: 13, fontWeight: 600, borderRadius: 10, cursor: 'pointer' }}
            >Excluir</button>
          )}
          <button
            onClick={() => form.nome && onSave(form)}
            disabled={!form.nome}
            style={{ padding: '9px 24px', background: form.nome ? '#2E5AAC' : '#BBD3F0', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: form.nome ? 'pointer' : 'not-allowed' }}
          >
            {isEdit ? 'Salvar alterações' : `Criar equipe${form.membroIds.length > 0 ? ` (${form.membroIds.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
