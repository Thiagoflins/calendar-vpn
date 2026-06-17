'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PersonFormDialog } from '@/components/people/PersonFormDialog';
import { IndisponibilidadeDialog } from '@/components/people/IndisponibilidadeDialog';
import { usePeople, useCreatePerson, useUpdatePerson, useDeactivatePerson } from '@/hooks/usePeople';
import { useFuncoes } from '@/hooks/useFuncoes';
import { Person } from '@/types';

const PAGE_SIZE = 10;

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
}

const AVATAR_PALETTES = [
  { bg: '#1C3568', text: '#FFFFFF' },
  { bg: '#065F46', text: '#FFFFFF' },
  { bg: '#7C2D12', text: '#FFFFFF' },
  { bg: '#4C1D95', text: '#FFFFFF' },
  { bg: '#9D174D', text: '#FFFFFF' },
  { bg: '#0C4A6E', text: '#FFFFFF' },
  { bg: '#3B1F0A', text: '#FFFFFF' },
  { bg: '#14532D', text: '#FFFFFF' },
];

function avatarPalette(name: string) {
  return AVATAR_PALETTES[name.charCodeAt(0) % AVATAR_PALETTES.length];
}

type Toast = { msg: string; person: Person } | null;

const CSS = `
  @keyframes vpn-fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes vpn-rowIn {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes vpn-toast {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes vpn-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  .vpn-page { animation: vpn-fadeUp 0.35s cubic-bezier(.22,.68,0,1.2) both; }

  .vpn-row {
    display: grid;
    grid-template-columns: 2.8fr 1.4fr 108px 114px 72px;
    align-items: center;
    padding: 0 28px;
    height: 62px;
    border-bottom: 1px solid #F2F1EE;
    transition: background 0.13s ease;
    animation: vpn-rowIn 0.28s ease both;
  }
  .vpn-row:last-child { border-bottom: none; }
  .vpn-row:hover { background: #FAFAF8; }

  .vpn-act {
    width: 30px; height: 30px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 7px; border: none; background: transparent;
    cursor: pointer; transition: background 0.13s, color 0.13s;
    flex-shrink: 0;
  }

  .vpn-search:focus {
    outline: none;
    border-color: #1C3568 !important;
    box-shadow: 0 0 0 3px rgba(28,53,104,0.09);
  }
  .vpn-select:focus { outline: none; border-color: #1C3568 !important; }

  .vpn-stat {
    padding: 22px 26px;
    transition: background 0.15s;
    cursor: default;
  }
  .vpn-stat:hover { background: #FAFAF8; }

  .vpn-add {
    transition: background 0.15s, box-shadow 0.15s, transform 0.15s;
  }
  .vpn-add:hover {
    background: #162A53 !important;
    box-shadow: 0 6px 16px rgba(28,53,104,0.28) !important;
    transform: translateY(-1px);
  }
  .vpn-add:active { transform: translateY(0); }

  .vpn-seg-btn {
    padding: 5px 15px;
    border-radius: 7px;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-family: 'Outfit', sans-serif;
    transition: all 0.13s;
  }

  .vpn-act-edit { color: #C4BFB8; }
  .vpn-act-edit:hover { background: #F0EFEC; color: #6B6860; }

  .vpn-act-deact { color: #FBBFBF; }
  .vpn-act-deact:hover { background: #FEF2F2; color: #DC2626; }

  .vpn-pg-btn {
    width: 28px; height: 28px; border-radius: 6px; border: 1px solid #E5E7EB;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 12px; transition: background 0.12s, color 0.12s;
  }
  .vpn-pg-btn:disabled { cursor: not-allowed; }

  .vpn-toast-btn {
    background: none; border: none; cursor: pointer;
    font-size: 12px; font-weight: 500; padding: 2px 6px; border-radius: 4px;
    font-family: 'Outfit', sans-serif; white-space: nowrap;
    transition: color 0.12s;
  }

  .vpn-active-dot {
    animation: vpn-pulse 2.4s ease-in-out infinite;
  }
`;

export default function PessoasPage() {
  const { data: people = [] } = usePeople();
  const { data: funcoesList = [] } = useFuncoes();
  const funcaoNomes = funcoesList.map(f => f.nome);
  const createPerson = useCreatePerson();
  const updatePerson = useUpdatePerson();
  const deactivatePerson = useDeactivatePerson();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [funcaoFilter, setFuncaoFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [indispPerson, setIndispPerson] = useState<Person | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const filtered = people.filter(p => {
    const nm = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || (p.email ?? '').toLowerCase().includes(search.toLowerCase());
    const st = filter === 'todos' || (filter === 'ativo' ? p.ativo : !p.ativo);
    const fn = !funcaoFilter || p.funcoes.includes(funcaoFilter);
    return nm && st && fn;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = people.filter(p => p.ativo).length;
  const inactiveCount = people.filter(p => !p.ativo).length;

  function showToast(msg: string, person: Person) {
    setToast({ msg, person });
    setTimeout(() => setToast(null), 4500);
  }

  const handleSave = async (data: Omit<Person, 'id'>) => {
    if (editPerson) {
      await updatePerson.mutateAsync({ id: editPerson.id, patch: data });
      showToast(`"${data.nome}" atualizado com sucesso`, { ...editPerson, ...data });
    } else {
      await createPerson.mutateAsync(data);
      showToast(`"${data.nome}" adicionado com sucesso`, data as Person);
    }
    setShowForm(false);
    setEditPerson(null);
  };

  const openEdit = (p: Person) => { setEditPerson(p); setShowForm(true); };

  const handleDeactivate = async (p: Person) => {
    await deactivatePerson.mutateAsync(p.id);
    showToast(`"${p.nome}" foi desativado`, p);
  };

  const stats = [
    { label: 'Total de membros',  value: people.length,         color: '#0F0E0C', bar: '#1C3568', pct: 100 },
    { label: 'Membros ativos',    value: activeCount,            color: '#059669', bar: '#10B981', pct: people.length ? (activeCount / people.length) * 100 : 0 },
    { label: 'Membros inativos',  value: inactiveCount,          color: '#B45309', bar: '#F59E0B', pct: people.length ? (inactiveCount / people.length) * 100 : 0 },
    { label: 'Funções ativas',    value: funcoesList.length,     color: '#6D28D9', bar: '#8B5CF6', pct: Math.min(100, funcoesList.length * 12) },
  ];

  return (
    <AppShell onAddPerson={() => { setEditPerson(null); setShowForm(true); }}>
      <style>{CSS}</style>

      <div
        className="vpn-page"
        style={{ padding: '36px 36px 80px', background: '#F5F4F1', minHeight: '100%' }}
      >

        {/* ── Stats ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          background: '#FFFFFF', borderRadius: 14,
          border: '1px solid #ECEAE6',
          marginBottom: 22,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="vpn-stat"
              style={{ borderRight: i < 3 ? '1px solid #F2F1EE' : 'none' }}
            >
              <div style={{
                fontSize: 32, fontWeight: 700, color: s.color,
                lineHeight: 1, letterSpacing: '-0.04em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: '#A8A59E', marginTop: 5, fontWeight: 400, letterSpacing: '0.01em' }}>
                {s.label}
              </div>
              <div style={{ marginTop: 12, height: 2, borderRadius: 2, background: '#F2F1EE', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2, background: s.bar,
                  width: `${Math.max(4, s.pct)}%`,
                  transition: 'width 1s cubic-bezier(.22,.68,0,1)',
                  opacity: 0.75,
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 300 }}>
            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M21 21L16.514 16.506M19 11C19 15.418 15.418 19 11 19C6.582 19 3 15.418 3 11C3 6.582 6.582 3 11 3C15.418 3 19 6.582 19 11Z" stroke="#C4BFB8" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              className="vpn-search"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por nome ou e-mail…"
              style={{
                width: '100%', height: 38, padding: '0 12px 0 33px',
                borderRadius: 8, border: '1px solid #ECEAE6',
                fontSize: 13, background: '#FFFFFF', color: '#0F0E0C',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                fontFamily: "'Outfit', sans-serif",
              }}
            />
          </div>

          {/* Função */}
          <div style={{ position: 'relative' }}>
            <select
              className="vpn-select"
              value={funcaoFilter}
              onChange={e => { setFuncaoFilter(e.target.value); setPage(1); }}
              style={{
                height: 38, padding: '0 30px 0 12px',
                borderRadius: 8, border: '1px solid #ECEAE6',
                fontSize: 13,
                background: funcaoFilter ? '#EEF3FB' : '#FFFFFF',
                color: funcaoFilter ? '#1C3568' : '#A8A59E',
                cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
                transition: 'all 0.15s',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <option value="">Todas as funções</option>
              {funcoesList.map(f => <option key={f.id} value={f.nome}>{f.nome}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="12" height="12" fill="none" viewBox="0 0 24 24">
              <path d="M6 9L12 15L18 9" stroke={funcaoFilter ? '#1C3568' : '#C4BFB8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div style={{ flex: 1 }} />

          {/* Status segmented */}
          <div style={{ display: 'flex', gap: 2, padding: 3, background: '#ECEAE6', borderRadius: 10 }}>
            {([
              { v: 'todos',   l: 'Todos' },
              { v: 'ativo',   l: 'Ativos' },
              { v: 'inativo', l: 'Inativos' },
            ] as const).map(f => (
              <button
                key={f.v}
                className="vpn-seg-btn"
                onClick={() => { setFilter(f.v); setPage(1); }}
                style={{
                  background: filter === f.v ? '#FFFFFF' : 'transparent',
                  color: filter === f.v ? '#0F0E0C' : '#A8A59E',
                  fontWeight: filter === f.v ? 500 : 400,
                  boxShadow: filter === f.v ? '0 1px 3px rgba(0,0,0,0.09)' : 'none',
                }}
              >
                {f.l}
              </button>
            ))}
          </div>

          <button
            onClick={() => { setEditPerson(null); setShowForm(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, border: 'none', background: '#2E5AAC', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0, height: 36 }}
          >
            <span style={{ fontSize: 17, lineHeight: 1 }}>+</span> Membro
          </button>
        </div>

        {/* ── Table ── */}
        <div style={{
          background: '#FFFFFF', borderRadius: 14,
          border: '1px solid #ECEAE6',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2.8fr 1.4fr 108px 114px 72px',
            padding: '11px 28px',
            borderBottom: '1px solid #ECEAE6',
            background: '#FAFAF8',
          }}>
            {['Nome', 'Funções', 'Status', 'Cadastro', ''].map((h, i) => (
              <div key={i} style={{
                fontSize: 10, fontWeight: 600, color: '#C4BFB8',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {h}
              </div>
            ))}
          </div>

          {/* Empty */}
          {filtered.length === 0 && (
            <div style={{ padding: '80px 28px', textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: '#F5F4F1', margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z"
                    stroke="#D4D2CE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#6B6860', marginBottom: 5 }}>
                Nenhum membro encontrado
              </div>
              <div style={{ fontSize: 13, color: '#C4BFB8' }}>
                Ajuste os filtros ou adicione um novo membro
              </div>
            </div>
          )}

          {/* Rows */}
          {paged.map((p, pi) => {
            const av = avatarPalette(p.nome);
            return (
              <div
                key={p.id}
                className="vpn-row"
                style={{ animationDelay: `${pi * 0.035}s` }}
              >
                {/* Nome */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: av.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: av.text,
                      letterSpacing: '0.04em',
                    }}>
                      {initials(p.nome)}
                    </div>
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 10, height: 10, borderRadius: '50%',
                      background: p.ativo ? '#10B981' : '#D4D2CE',
                      border: '2px solid #FFFFFF',
                    }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#0F0E0C', lineHeight: 1.3 }}>
                      {p.nome}
                    </div>
                    {p.email && (
                      <div style={{ fontSize: 11, color: '#A8A59E', marginTop: 1 }}>{p.email}</div>
                    )}
                  </div>
                </div>

                {/* Funções */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                  {p.funcoes.slice(0, 2).map(fn => (
                    <span key={fn} style={{
                      fontSize: 11, color: '#6B6860',
                      background: '#F5F4F1', border: '1px solid #ECEAE6',
                      padding: '2px 8px', borderRadius: 5,
                      whiteSpace: 'nowrap', fontWeight: 400,
                    }}>
                      {fn}
                    </span>
                  ))}
                  {p.funcoes.length > 2 && (
                    <span style={{ fontSize: 11, color: '#C4BFB8' }}>+{p.funcoes.length - 2}</span>
                  )}
                  {p.funcoes.length === 0 && (
                    <span style={{ fontSize: 13, color: '#D4D2CE' }}>—</span>
                  )}
                </div>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    className={p.ativo ? 'vpn-active-dot' : ''}
                    style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: p.ativo ? '#10B981' : '#D4D2CE',
                    }}
                  />
                  <span style={{
                    fontSize: 12, fontWeight: 400,
                    color: p.ativo ? '#059669' : '#A8A59E',
                  }}>
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Data */}
                <div style={{ fontSize: 12, color: '#C4BFB8', fontWeight: 400 }}>
                  {fmtDate(p.criadoEm)}
                </div>

                {/* Ações */}
                <div style={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
                  <button className="vpn-act vpn-act-edit" onClick={() => openEdit(p)} title="Editar">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                      <path d="M11 4H4C3.448 4 3 4.448 3 5V20C3 20.552 3.448 21 4 21H19C19.552 21 20 20.552 20 20V13M18.586 2.586C19.367 1.805 20.633 1.805 21.414 2.586C22.195 3.367 22.195 4.633 21.414 5.414L12 14.828L8 16L9.172 12L18.586 2.586Z"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="vpn-act" onClick={() => setIndispPerson(p)} title="Indisponibilidade" style={{ color: '#C4BFB8' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFFBEB'; (e.currentTarget as HTMLButtonElement).style.color = '#D97706'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#C4BFB8'; }}
                  >
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                      <path d="M8 2V5M16 2V5M3 8H21M5 4H19C20.105 4 21 4.895 21 6V19C21 20.105 20.105 21 19 21H5C3.895 21 3 20.105 3 19V6C3 4.895 3.895 4 5 4ZM12 11V13M12 16H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {p.ativo && (
                    <button className="vpn-act vpn-act-deact" onClick={() => handleDeactivate(p)} title="Desativar membro">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M6.34 6.34L17.66 17.66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Footer com paginação */}
          {filtered.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 28px', borderTop: '1px solid #F2F1EE', background: '#FAFAF8' }}>
              <span style={{ fontSize: 12, color: '#C4BFB8' }}>
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </span>
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button className="vpn-pg-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}
                    style={{ background: page === 1 ? '#F9FAFB' : '#fff', color: page === 1 ? '#C4C9D4' : '#374151' }}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} className="vpn-pg-btn" onClick={() => setPage(p)}
                      style={{ background: p === page ? '#2E5AAC' : '#fff', color: p === page ? '#fff' : '#374151', borderColor: p === page ? '#2E5AAC' : '#E5E7EB', fontWeight: p === page ? 600 : 400 }}>
                      {p}
                    </button>
                  ))}
                  <button className="vpn-pg-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                    style={{ background: page === totalPages ? '#F9FAFB' : '#fff', color: page === totalPages ? '#C4C9D4' : '#374151' }}>›</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 600,
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '13px 16px',
          background: '#0F0E0C',
          borderRadius: 11,
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
          color: '#FFFFFF', fontSize: 13,
          maxWidth: 360,
          animation: 'vpn-toast 0.3s cubic-bezier(.22,.68,0,1.2) both',
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: '#10B981',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24">
              <path d="M20 6L9 17L4 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ flex: 1, color: '#E5E3DF', fontSize: 13, fontWeight: 400 }}>
            {toast.msg}
          </span>
          <button
            className="vpn-toast-btn"
            onClick={() => { openEdit(toast.person); setToast(null); }}
            style={{ color: '#A8A59E' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#A8A59E'}
          >
            Ver perfil
          </button>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'none', border: 'none', color: '#6B6860',
              cursor: 'pointer', fontSize: 20, padding: 0, lineHeight: 1,
              transition: 'color 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#6B6860'}
          >
            ×
          </button>
        </div>
      )}

      {showForm && (
        <PersonFormDialog
          editPerson={editPerson}
          funcoes={funcaoNomes}
          onClose={() => { setShowForm(false); setEditPerson(null); }}
          onSave={handleSave}
        />
      )}

      {indispPerson && (
        <IndisponibilidadeDialog
          person={indispPerson}
          onClose={() => setIndispPerson(null)}
        />
      )}
    </AppShell>
  );
}
