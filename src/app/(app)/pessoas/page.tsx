'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PersonFormDialog } from '@/components/people/PersonFormDialog';
import { usePeople, useCreatePerson, useUpdatePerson, useDeactivatePerson } from '@/hooks/usePeople';
import { useFuncoes } from '@/hooks/useFuncoes';
import { Person } from '@/types';
import { getColor, COLORS } from '@/lib/colors';

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
}

type Toast = { msg: string; person: Person } | null;

export default function PessoasPage() {
  const { data: people = [] } = usePeople();
  const { data: funcoesList = [] } = useFuncoes();
  const funcaoNomes = funcoesList.map(f => f.nome);
  const createPerson = useCreatePerson();
  const updatePerson = useUpdatePerson();
  const deactivatePerson = useDeactivatePerson();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [showForm, setShowForm] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const filtered = people.filter(p => {
    const nm = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || (p.email ?? '').toLowerCase().includes(search.toLowerCase());
    const st = filter === 'todos' || (filter === 'ativo' ? p.ativo : !p.ativo);
    return nm && st;
  });

  function showToast(msg: string, person: Person) {
    setToast({ msg, person });
    setTimeout(() => setToast(null), 4000);
  }

  const handleSave = async (data: Omit<Person, 'id'>) => {
    if (editPerson) {
      await updatePerson.mutateAsync({ id: editPerson.id, patch: data });
      showToast(`"${data.nome}" atualizado`, { ...editPerson, ...data });
    } else {
      await createPerson.mutateAsync(data);
      showToast(`"${data.nome}" adicionado`, data as Person);
    }
    setShowForm(false);
    setEditPerson(null);
  };

  const openEdit = (p: Person) => { setEditPerson(p); setShowForm(true); setOpenMenu(null); };

  const handleDeactivate = async (p: Person) => {
    await deactivatePerson.mutateAsync(p.id);
    showToast(`"${p.nome}" desativado`, p);
    setOpenMenu(null);
  };

  return (
    <AppShell onAddPerson={() => { setEditPerson(null); setShowForm(true); }}>
      {openMenu && <div onClick={() => setOpenMenu(null)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />}

      <div style={{ padding: '28px 28px 80px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#101828' }}>Membros</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: '#9AA3B5', fontWeight: 400 }}>Gerencie os membros e suas funções no grupo.</p>
        </div>

        {/* Controls bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>

          <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
            Todos os membros{' '}
            <span style={{ color: '#B0B7C3', fontWeight: 400 }}>{filtered.length}</span>
          </span>

          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{ position: 'relative', width: 240 }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="15" height="15" fill="none" viewBox="0 0 24 24">
              <path d="M21 21L16.514 16.506M19 11C19 15.418 15.418 19 11 19C6.582 19 3 15.418 3 11C3 6.582 6.582 3 11 3C15.418 3 19 6.582 19 11Z" stroke="#B0B7C3" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar"
              style={{ width: '100%', height: 36, padding: '0 12px 0 32px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, fontWeight: 400, outline: 'none', background: '#fff', boxSizing: 'border-box', color: '#374151' }}
            />
          </div>

          {/* Filter toggle */}
          <div style={{ display: 'flex', gap: 1, padding: 3, background: '#F3F4F6', borderRadius: 8 }}>
            {(['todos', 'ativo', 'inativo'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: filter === f ? '#fff' : 'transparent', color: filter === f ? '#374151' : '#9AA3B5', cursor: 'pointer', fontSize: 13, fontWeight: filter === f ? 500 : 400, boxShadow: filter === f ? '0 1px 2px rgba(16,24,40,0.07)' : 'none', transition: 'all 0.12s' }}
              >
                {f === 'todos' ? 'Todos' : f === 'ativo' ? 'Ativos' : 'Inativos'}
              </button>
            ))}
          </div>

          {/* Add button */}
          <button
            onClick={() => { setEditPerson(null); setShowForm(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 6, border: 'none', background: '#2E5AAC', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Membro
          </button>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>

          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 110px 120px 40px', padding: '10px 20px', borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}>
            {['Nome', 'Funções', 'Status', 'Cadastro', ''].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 500, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div style={{ padding: '56px 20px', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z" stroke="#C4C9D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 400, color: '#9AA3B5' }}>Nenhum membro encontrado</div>
            </div>
          ) : filtered.map((p, pi) => {
            const cl = getColor(COLORS[p.nome.charCodeAt(0) % COLORS.length]);
            const isLast = pi === filtered.length - 1;
            return (
              <div
                key={p.id}
                style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 110px 120px 40px', padding: '12px 20px', borderBottom: isLast ? 'none' : '1px solid #F5F5F5', alignItems: 'center', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFAFA'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
              >
                {/* Nome */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: cl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: cl.text, flexShrink: 0 }}>
                    {initials(p.nome)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#18181B' }}>{p.nome}</div>
                    {p.email && <div style={{ fontSize: 12, fontWeight: 400, color: '#B0B7C3', marginTop: 1 }}>{p.email}</div>}
                  </div>
                </div>

                {/* Funções */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {p.funcoes.slice(0, 2).map(fn => (
                    <span key={fn} style={{ fontSize: 11, fontWeight: 400, color: '#6B7280', background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '2px 7px', borderRadius: 999 }}>{fn}</span>
                  ))}
                  {p.funcoes.length > 2 && (
                    <span style={{ fontSize: 11, fontWeight: 400, color: '#B0B7C3' }}>+{p.funcoes.length - 2}</span>
                  )}
                  {p.funcoes.length === 0 && <span style={{ fontSize: 12, color: '#D1D5DB' }}>—</span>}
                </div>

                {/* Status */}
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 400, padding: '3px 9px', borderRadius: 999, background: p.ativo ? '#F0FDF4' : '#FFF5F5', color: p.ativo ? '#15803D' : '#DC2626', border: `1px solid ${p.ativo ? '#BBF7D0' : '#FECACA'}` }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: p.ativo ? '#22C55E' : '#EF4444', flexShrink: 0 }} />
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Data */}
                <div style={{ fontSize: 13, fontWeight: 400, color: '#9AA3B5' }}>{fmtDate(p.criadoEm)}</div>

                {/* Menu */}
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === p.id ? null : p.id); }}
                    style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#C4C9D4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLButtonElement).style.color = '#6B7280'; }}
                    onMouseLeave={e => { if (openMenu !== p.id) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#C4C9D4'; }}}
                  >
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                  </button>
                  {openMenu === p.id && (
                    <div style={{ position: 'absolute', top: 32, right: 0, zIndex: 50, background: '#fff', borderRadius: 10, boxShadow: '0 4px 20px rgba(16,24,40,0.10)', border: '1px solid #E5E7EB', minWidth: 148, overflow: 'hidden' }}>
                      <button onClick={() => openEdit(p)} style={{ width: '100%', padding: '9px 13px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 400, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M11 4H4C3.448 4 3 4.448 3 5V20C3 20.552 3.448 21 4 21H19C19.552 21 20 20.552 20 20V13M18.586 2.586C19.367 1.805 20.633 1.805 21.414 2.586C22.195 3.367 22.195 4.633 21.414 5.414L12 14.828L8 16L9.172 12L18.586 2.586Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Editar
                      </button>
                      {p.ativo && (
                        <>
                          <div style={{ height: 1, background: '#F5F5F5' }} />
                          <button onClick={() => handleDeactivate(p)} style={{ width: '100%', padding: '9px 13px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 400, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M18.364 18.364C21.879 14.849 21.879 9.151 18.364 5.636C14.849 2.121 9.151 2.121 5.636 5.636M18.364 18.364C14.849 21.879 9.151 21.879 5.636 18.364C2.121 14.849 2.121 9.151 5.636 5.636M18.364 18.364L5.636 5.636" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            Desativar
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 500, display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#18181B', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', color: '#fff', fontSize: 13, fontWeight: 400, maxWidth: 320 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17L4 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ flex: 1 }}>{toast.msg}</span>
          <button onClick={() => { openEdit(toast.person); setToast(null); }} style={{ background: 'none', border: 'none', color: '#9AA3B5', cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '2px 4px', whiteSpace: 'nowrap' }}>Ver perfil</button>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
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
    </AppShell>
  );
}
