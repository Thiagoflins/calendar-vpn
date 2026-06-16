'use client';
import { useState, useRef, useEffect } from 'react';
import { Team } from '@/types';
import { getColor } from '@/lib/colors';

type Props = {
  value: string;
  onChange: (value: string) => void;
  teams: Team[];
  placeholder?: string;
};

export function EquipeSelect({ value, onChange, teams, placeholder = 'Buscar equipe...' }: Props) {
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

  const selected = teams.find(t => t.id === value || t.nome === value);
  const displayText = selected ? selected.nome : value;
  const query = open ? search : displayText;

  const filtered = teams.filter(t =>
    t.nome.toLowerCase().includes(query.toLowerCase()) ||
    (t.tipo ?? '').toLowerCase().includes(query.toLowerCase())
  );

  function handleFocus() {
    setSearch(displayText);
    setOpen(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function pick(t: Team) {
    onChange(t.nome);
    setOpen(false);
    setSearch('');
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
    setOpen(false);
    setSearch('');
  }

  function handleBlur(e: React.FocusEvent) {
    if (ref.current?.contains(e.relatedTarget as Node)) return;
    setOpen(false);
    setSearch('');
  }

  const cl = selected ? getColor(selected.cor ?? 'azul') : null;
  const displayValue = open ? search : displayText;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {selected && !open && cl && (
          <div style={{ position: 'absolute', left: 10, width: 26, height: 26, borderRadius: 6, background: cl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: cl.dot }} />
          </div>
        )}
        <input
          ref={inputRef}
          value={displayValue}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
              <div style={{ padding: '14px 12px', textAlign: 'center', color: '#9AA3B5', fontSize: 13 }}>Nenhuma equipe encontrada</div>
            ) : filtered.map((t, i) => {
              const isSel = t.nome === value || t.id === value;
              const c = getColor(t.cor ?? 'azul');
              return (
                <div
                  key={t.id}
                  onMouseDown={e => { e.preventDefault(); pick(t); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    background: isSel ? '#EEF2FF' : i % 2 === 0 ? '#fff' : '#FAFBFC',
                    cursor: 'pointer', borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none',
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: isSel ? c.bg : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: isSel ? 600 : 400, color: '#101828' }}>{t.nome}</div>
                    {t.tipo && <div style={{ fontSize: 11, color: '#9AA3B5', marginTop: 1 }}>{t.tipo}</div>}
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
