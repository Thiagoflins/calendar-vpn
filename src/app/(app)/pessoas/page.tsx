'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PersonFormDialog } from '@/components/people/PersonFormDialog';
import { usePeople, useCreatePerson, useUpdatePerson, useDeactivatePerson } from '@/hooks/usePeople';
import { Person } from '@/types';
import { getColor, COLORS } from '@/lib/colors';

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
}

export default function PessoasPage() {
  const { data: people = [] } = usePeople();
  const createPerson = useCreatePerson();
  const updatePerson = useUpdatePerson();
  const deactivatePerson = useDeactivatePerson();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [showForm, setShowForm] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);

  const filtered = people.filter(p => {
    const nm = !search || p.nome.toLowerCase().includes(search.toLowerCase());
    const st = filter === 'todos' || (filter === 'ativo' ? p.ativo : !p.ativo);
    return nm && st;
  });

  const handleSave = async (data: Omit<Person, 'id'>) => {
    if (editPerson) {
      await updatePerson.mutateAsync({ id: editPerson.id, patch: data });
    } else {
      await createPerson.mutateAsync(data);
    }
    setShowForm(false);
    setEditPerson(null);
  };

  const openEdit = (p: Person) => {
    setEditPerson(p);
    setShowForm(true);
  };

  return (
    <AppShell onAddPerson={() => { setEditPerson(null); setShowForm(true); }}>
      <div style={{ padding: 24 }}>
        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#9AA3B5' }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar membro..."
              style={{ width: '100%', height: 40, padding: '0 12px 0 34px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 14, fontWeight: 400, outline: 'none', background: '#fff' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['todos', 'ativo', 'inativo'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid', borderColor: filter === f ? '#2E5AAC' : '#E5E7EB', background: filter === f ? '#E6F1FB' : '#fff', color: filter === f ? '#2E5AAC' : '#6B7280', cursor: 'pointer', fontSize: 13, fontWeight: 400 }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 6, overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>Nenhum membro encontrado.</div>}
          {filtered.map((p, pi) => {
            const cl = getColor(COLORS[p.nome.charCodeAt(0) % 6]);
            return (
              <div
                key={p.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: pi < filtered.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFBFD'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
              >
                <div title={p.nome} style={{ width: 38, height: 38, borderRadius: '50%', background: cl.bg, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: cl.text, flexShrink: 0 }}>
                  {initials(p.nome)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#101828' }}>{p.nome}</span>
                    {!p.ativo && <span style={{ fontSize: 11, fontWeight: 400, color: '#993C1D', background: '#FAECE7', padding: '1px 7px', borderRadius: 4 }}>Inativo</span>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 400, color: '#9AA3B5', marginBottom: 4 }}>{p.email}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {p.funcoes.map(fn => (
                      <span key={fn} style={{ fontSize: 11, fontWeight: 400, color: '#534AB7', background: '#EEEDFE', padding: '2px 8px', borderRadius: 4 }}>{fn}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => openEdit(p)} style={{ padding: '5px 12px', background: '#F7F9FC', border: '1px solid #E5E7EB', color: '#374151', fontSize: 12, borderRadius: 6, cursor: 'pointer', fontWeight: 400 }}>Editar</button>
                  {p.ativo && (
                    <button onClick={() => deactivatePerson.mutate(p.id)} style={{ padding: '5px 12px', background: '#FAECE7', border: '1px solid #FAECE7', color: '#993C1D', fontSize: 12, borderRadius: 6, cursor: 'pointer', fontWeight: 400 }}>Desativar</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <PersonFormDialog
          editPerson={editPerson}
          onClose={() => { setShowForm(false); setEditPerson(null); }}
          onSave={handleSave}
        />
      )}
    </AppShell>
  );
}
