'use client';
import { useState, useRef, useEffect } from 'react';
import { Person } from '@/types';
import { getInitials } from '@/lib/personUtils';

type Props = {
  value: string;
  onChange: (value: string) => void;
  people: Person[];
  mode?: 'nome' | 'id';
  placeholder?: string;
  unavailableIds?: string[];
};

export function PessoaSelect({ value, onChange, people, mode = 'nome', placeholder = 'Buscar pessoa...', unavailableIds = [] }: Props) {
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

  const selected = mode === 'id'
    ? people.find(p => p.id === value)
    : people.find(p => p.nome === value);

  const displayText = selected ? selected.nome : (mode === 'nome' ? value : '');
  const query = open ? search : displayText;

  const filtered = people.filter(p =>
    p.nome.toLowerCase().includes(query.toLowerCase()) ||
    p.funcoes.some(fn => fn.toLowerCase().includes(query.toLowerCase()))
  );

  function handleFocus() {
    setSearch(displayText);
    setOpen(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function pick(p: Person) {
    onChange(mode === 'id' ? p.id : p.nome);
    setOpen(false);
    setSearch('');
  }

  function handleBlurInput(e: React.FocusEvent) {
    if (ref.current?.contains(e.relatedTarget as Node)) return;
    if (mode === 'nome' && search && search !== displayText) onChange(search);
    setOpen(false);
    setSearch('');
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
    setOpen(false);
    setSearch('');
  }

  const displayValue = open ? search : displayText;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {selected && !open && (
          <div style={{ position: 'absolute', left: 10, width: 26, height: 26, borderRadius: '50%', background: '#2E5AAC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', pointerEvents: 'none', zIndex: 1 }}>
            {getInitials(selected.nome)}
          </div>
        )}
        <input
          ref={inputRef}
          value={displayValue}
          onChange={e => { setSearch(e.target.value); if (mode === 'nome') onChange(e.target.value); setOpen(true); }}
          onFocus={handleFocus}
          onBlur={handleBlurInput}
          placeholder={placeholder}
          style={{
            width: '100%', height: 40,
            paddingLeft: selected && !open ? 44 : 12,
            paddingRight: value ? 32 : 12,
            borderRadius: 10, border: `1px solid ${open ? '#2E5AAC' : '#D1D5DB'}`,
            fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box',
            color: '#101828', transition: 'border-color 0.15s',
          }}
        />
        {value && (
          <button onMouseDown={clear} style={{ position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#9AA3B5', fontSize: 16, padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>×</button>
        )}
      </div>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 400, background: '#fff', borderRadius: 10, boxShadow: '0 8px 32px rgba(16,24,40,0.14)', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '14px 12px', textAlign: 'center', color: '#9AA3B5', fontSize: 13 }}>
                {search && mode === 'nome' ? `Usar "${search}" como nome` : 'Nenhuma pessoa encontrada'}
              </div>
            ) : filtered.map((p, i) => {
              const isSel = mode === 'id' ? p.id === value : p.nome === value;
              const isUnavailable = unavailableIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onMouseDown={e => { e.preventDefault(); if (!isUnavailable) pick(p); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    background: isSel ? '#EEF2FF' : i % 2 === 0 ? '#fff' : '#FAFBFC',
                    cursor: isUnavailable ? 'not-allowed' : 'pointer',
                    borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none',
                    opacity: isUnavailable ? 0.5 : 1,
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: isSel ? '#2E5AAC' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: isSel ? '#fff' : '#6B7280', flexShrink: 0 }}>
                    {getInitials(p.nome)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: isSel ? 600 : 400, color: '#101828' }}>{p.nome}</div>
                    {isUnavailable
                      ? <div style={{ fontSize: 11, color: '#F59E0B', marginTop: 1 }}>⚠ Indisponível nesta data</div>
                      : p.funcoes.length > 0 && <div style={{ fontSize: 11, color: '#9AA3B5', marginTop: 1 }}>{p.funcoes.slice(0, 3).join(' · ')}</div>
                    }
                  </div>
                  {isSel && <span style={{ color: '#2E5AAC', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
