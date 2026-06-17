'use client';
import { useState, useRef, useEffect } from 'react';
import { Person } from '@/types';

function initials(nome: string) {
  return nome.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
}

type Props = {
  values: string[];
  onChange: (values: string[]) => void;
  people: Person[];
  mode?: 'nome' | 'id';
  placeholder?: string;
  unavailableIds?: string[];
};

export function PessoaMultiSelect({ values, onChange, people, mode = 'nome', placeholder = 'Adicionar pessoa...', unavailableIds = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = people.filter(p =>
    (p.nome.toLowerCase().includes(search.toLowerCase()) ||
     p.funcoes.some(fn => fn.toLowerCase().includes(search.toLowerCase())))
  );

  function getKey(p: Person) { return mode === 'id' ? p.id : p.nome; }
  function getDisplayName(key: string) {
    if (mode === 'id') return people.find(p => p.id === key)?.nome ?? key;
    return key;
  }

  function toggle(p: Person) {
    const key = getKey(p);
    onChange(values.includes(key) ? values.filter(v => v !== key) : [...values, key]);
  }

  function remove(key: string) {
    onChange(values.filter(v => v !== key));
  }

  function addFreeText() {
    if (mode === 'id') { setSearch(''); return; } // id mode: only pick from list
    const t = search.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setSearch('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); addFreeText(); }
    if (e.key === 'Escape') { setOpen(false); setSearch(''); }
    if (e.key === 'Backspace' && !search && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div ref={ref}>
      {/* Chips + input box */}
      <div
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
        style={{
          minHeight: 42, padding: '6px 10px', borderRadius: 10,
          border: `1px solid ${open ? '#2E5AAC' : '#D1D5DB'}`,
          background: '#fff', cursor: 'text', display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center',
          transition: 'border-color 0.15s', boxSizing: 'border-box',
        }}
      >
        {values.map(key => {
          const p = mode === 'id' ? people.find(x => x.id === key) : people.find(x => x.nome === key);
          const displayName = getDisplayName(key);
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px 2px 4px', borderRadius: 999, background: '#EEF2FF', border: '1px solid #C7D7F5', flexShrink: 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#2E5AAC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>
                {initials(displayName)}
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#2E5AAC' }}>{displayName.split(' ')[0]}</span>
              {p?.funcoes[0] && <span style={{ fontSize: 11, color: '#6B9BD4' }}>· {p.funcoes[0]}</span>}
              <button
                onMouseDown={e => { e.stopPropagation(); remove(key); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B9BD4', fontSize: 15, padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}
              >×</button>
            </div>
          );
        })}
        <input
          ref={inputRef}
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={values.length === 0 ? placeholder : ''}
          style={{ border: 'none', outline: 'none', fontSize: 13, color: '#101828', background: 'transparent', minWidth: 140, flex: 1 }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{ position: 'relative', zIndex: 400 }}>
          <div style={{ position: 'absolute', top: 4, left: 0, right: 0, background: '#fff', borderRadius: 10, boxShadow: '0 8px 32px rgba(16,24,40,0.14)', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
              {filtered.length === 0 && !search ? (
                <div style={{ padding: '14px 12px', textAlign: 'center', color: '#9AA3B5', fontSize: 13 }}>Nenhuma pessoa cadastrada</div>
              ) : (
                <>
                  {search && !filtered.some(p => p.nome.toLowerCase() === search.toLowerCase()) && (
                    <div
                      onMouseDown={e => { e.preventDefault(); addFreeText(); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#F0F7FF', cursor: 'pointer', borderBottom: '1px solid #F3F4F6' }}
                    >
                      <span style={{ fontSize: 18 }}>✏️</span>
                      <span style={{ fontSize: 13, color: '#2E5AAC', fontWeight: 500 }}>Adicionar &quot;{search}&quot;</span>
                    </div>
                  )}
                  {filtered.map((p, i) => {
                    const isSel = values.includes(getKey(p));
                    const isUnavailable = unavailableIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onMouseDown={e => { e.preventDefault(); if (!isUnavailable) toggle(p); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                          background: isSel ? '#EEF2FF' : i % 2 === 0 ? '#fff' : '#FAFBFC',
                          cursor: isUnavailable ? 'not-allowed' : 'pointer',
                          borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none',
                          opacity: isUnavailable ? 0.5 : 1,
                        }}
                      >
                        <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${isSel ? '#2E5AAC' : '#D1D5DB'}`, background: isSel ? '#2E5AAC' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isSel && <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>✓</span>}
                        </div>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: isSel ? '#2E5AAC' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: isSel ? '#fff' : '#6B7280', flexShrink: 0 }}>
                          {initials(p.nome)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: isSel ? 600 : 400, color: '#101828' }}>{p.nome}</div>
                          {isUnavailable
                            ? <div style={{ fontSize: 11, color: '#F59E0B', marginTop: 1 }}>⚠ Indisponível nesta data</div>
                            : p.funcoes.length > 0 && <div style={{ fontSize: 11, color: '#9AA3B5', marginTop: 1 }}>{p.funcoes.slice(0, 3).join(' · ')}</div>
                          }
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
            {values.length > 0 && (
              <div style={{ padding: '7px 12px', borderTop: '1px solid #F3F4F6', background: '#FAFBFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>{values.length} pessoa{values.length !== 1 ? 's' : ''} selecionada{values.length !== 1 ? 's' : ''}</span>
                <button onMouseDown={e => { e.preventDefault(); setOpen(false); }} style={{ fontSize: 12, fontWeight: 600, color: '#2E5AAC', background: 'none', border: 'none', cursor: 'pointer' }}>Concluir</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
