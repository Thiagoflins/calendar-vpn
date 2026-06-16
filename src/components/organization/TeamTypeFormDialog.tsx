'use client';
import { useState, useRef, useEffect } from 'react';

type Props = {
  editNome?: string;
  onClose: () => void;
  onSave: (nome: string) => Promise<void>;
};

export function TeamTypeFormDialog({ editNome, onClose, onSave }: Props) {
  const [nome, setNome] = useState(editNome ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editNome;

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleSave() {
    const trimmed = nome.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      await onSave(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar tipo');
      setLoading(false);
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(16,24,40,0.45)', backdropFilter: 'blur(5px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(16,24,40,0.18)', overflow: 'hidden' }}>

        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M23 21V19C23 17.133 21.742 15.55 20 15.12M16 3.13C17.742 3.55 19 5.133 19 7C19 8.867 17.742 10.45 16 10.87M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z" stroke="#2E5AAC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#101828' }}>
              {isEdit ? 'Editar Tipo de Equipe' : 'Novo Tipo de Equipe'}
            </h2>
            <div style={{ fontSize: 12, color: '#9AA3B5', marginTop: 2 }}>Categoria para classificar equipes</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280', borderRadius: 8 }}>×</button>
        </div>

        <div style={{ padding: '24px' }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Nome do tipo <span style={{ color: '#D4537E' }}>*</span>
          </label>
          <input
            ref={inputRef}
            value={nome}
            onChange={e => setNome(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose(); }}
            placeholder="Ex.: Louvor, Mídia, Organização..."
            style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box', color: '#101828' }}
            onFocus={e => (e.target.style.borderColor = '#2E5AAC')}
            onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
          />
          {error && (
            <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: '#FBEAF0', border: '1px solid #F5C2CE', fontSize: 13, color: '#993556' }}>{error}</div>
          )}
          <div style={{ fontSize: 12, color: '#9AA3B5', marginTop: 6 }}>O tipo aparecerá na criação de equipes para melhor organização.</div>
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid #F0F2F5', display: 'flex', gap: 8, justifyContent: 'flex-end', background: '#FAFBFC' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', background: '#fff', border: '1px solid #D1D5DB', color: '#374151', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: 'pointer' }}>Cancelar</button>
          <button
            onClick={handleSave}
            disabled={!nome.trim() || loading}
            style={{ padding: '9px 24px', background: nome.trim() && !loading ? '#2E5AAC' : '#BBD3F0', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: nome.trim() && !loading ? 'pointer' : 'not-allowed', minWidth: 120 }}
          >{loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar tipo'}</button>
        </div>
      </div>
    </div>
  );
}
