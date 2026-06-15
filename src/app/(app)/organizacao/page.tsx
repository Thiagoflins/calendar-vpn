'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { TeamFormDialog } from '@/components/organization/TeamFormDialog';
import { useTeams, useCreateTeam, useUpdateTeam, useRemoveTeam } from '@/hooks/useTeams';
import { usePeople } from '@/hooks/usePeople';
import { Team } from '@/types';
import { getColor, COLORS } from '@/lib/colors';

const FNS = ['Pastor','Vocal','Teclado','Bateria','Baixo','Guitarra','Percussão','Violão','Mídia','Recepção','Pregador','Organização','Diaconato','Ujv'];

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
}

export default function OrganizacaoPage() {
  const { data: teams = [] } = useTeams();
  const { data: people = [] } = usePeople();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const removeTeam = useRemoveTeam();

  const [showForm, setShowForm] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);

  const handleSave = async (data: Omit<Team, 'id'>) => {
    if (editTeam) {
      await updateTeam.mutateAsync({ id: editTeam.id, patch: data });
    } else {
      await createTeam.mutateAsync(data);
    }
    setShowForm(false);
    setEditTeam(null);
  };

  const handleDelete = async (id: string) => {
    await removeTeam.mutateAsync(id);
    setShowForm(false);
    setEditTeam(null);
  };

  return (
    <AppShell onAddTeam={() => { setEditTeam(null); setShowForm(true); }}>
      <div style={{ padding: 24 }}>
        {/* Teams */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#101828', marginBottom: 14 }}>Equipes</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
            {teams.map(team => {
              const cl = getColor(team.cor);
              const lider = people.find(p => p.id === team.liderId);
              const membros = (team.membroIds ?? []).map(id => people.find(p => p.id === id)).filter(Boolean) as typeof people;
              return (
                <div key={team.id} style={{ background: '#fff', borderRadius: 10, padding: 18, border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 6, background: cl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: cl.dot }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 500, color: '#101828', marginBottom: 2 }}>{team.nome}</div>
                      <div style={{ fontSize: 12, fontWeight: 400, color: '#6B7280' }}>{membros.length} membros</div>
                    </div>
                    <button onClick={() => { setEditTeam(team); setShowForm(true); }} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 12, fontWeight: 400 }}>Editar</button>
                  </div>
                  {team.descricao && <div style={{ fontSize: 13, fontWeight: 400, color: '#6B7280', marginBottom: 10, lineHeight: '1.4' }}>{team.descricao}</div>}
                  {lider && <div style={{ fontSize: 12, fontWeight: 400, color: '#6B7280', marginBottom: 10 }}><span style={{ fontWeight: 500 }}>Líder: </span>{lider.nome}</div>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {membros.slice(0, 6).map(m => (
                      <div key={m.id} title={m.nome} style={{ width: 28, height: 28, borderRadius: '50%', background: cl.bg, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: cl.text, flexShrink: 0 }}>
                        {initials(m.nome)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Functions */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#101828', marginBottom: 14 }}>Funções</div>
          <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {FNS.map(fn => (
                <div key={fn} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 4, background: '#F7F9FC', border: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: 13, fontWeight: 400, color: '#374151' }}>{fn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <TeamFormDialog
          editTeam={editTeam}
          people={people}
          onClose={() => { setShowForm(false); setEditTeam(null); }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </AppShell>
  );
}
