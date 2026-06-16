'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { TeamFormDialog } from '@/components/organization/TeamFormDialog';
import { FuncaoFormDialog } from '@/components/organization/FuncaoFormDialog';
import { useTeams, useCreateTeam, useUpdateTeam, useRemoveTeam } from '@/hooks/useTeams';
import { usePeople } from '@/hooks/usePeople';
import { useFuncoes, useCreateFuncao, useUpdateFuncao, useRemoveFuncao } from '@/hooks/useFuncoes';
import { Team } from '@/types';
import { getColor, COLORS } from '@/lib/colors';

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
}

function AvatarStack({ ids, people }: { ids: string[]; people: ReturnType<typeof usePeople>['data'] }) {
  const all = (people ?? []);
  const members = ids.slice(0, 5).map(id => all.find(p => p.id === id)).filter(Boolean) as typeof all;
  const extra = ids.length - 5;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {members.map((m, i) => (
        <div
          key={m.id}
          title={m.nome}
          style={{ width: 28, height: 28, borderRadius: '50%', background: '#E5E7EB', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#6B7280', marginLeft: i > 0 ? -8 : 0, zIndex: members.length - i, position: 'relative' }}
        >
          {initials(m.nome)}
        </div>
      ))}
      {extra > 0 && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F3F4F6', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#6B7280', marginLeft: -8, position: 'relative', zIndex: 0 }}>+{extra}</div>
      )}
    </div>
  );
}

type FuncaoMenu = { id: string; x: number; y: number } | null;

export default function OrganizacaoPage() {
  const { data: teams = [] } = useTeams();
  const { data: people = [] } = usePeople();
  const { data: funcoes = [] } = useFuncoes();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const removeTeam = useRemoveTeam();
  const createFuncao = useCreateFuncao();
  const updateFuncao = useUpdateFuncao();
  const removeFuncao = useRemoveFuncao();

  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [showFuncaoForm, setShowFuncaoForm] = useState(false);
  const [editFuncao, setEditFuncao] = useState<{ id: string; nome: string } | null>(null);
  const [funcaoMenu, setFuncaoMenu] = useState<FuncaoMenu>(null);
  const [teamMenu, setTeamMenu] = useState<string | null>(null);

  const handleSaveTeam = async (data: Omit<Team, 'id'>) => {
    if (editTeam) await updateTeam.mutateAsync({ id: editTeam.id, patch: data });
    else await createTeam.mutateAsync(data);
    setShowTeamForm(false); setEditTeam(null);
  };

  const handleDeleteTeam = async (id: string) => {
    await removeTeam.mutateAsync(id);
    setShowTeamForm(false); setEditTeam(null);
  };

  const handleSaveFuncao = async (nome: string) => {
    if (editFuncao) await updateFuncao.mutateAsync({ id: editFuncao.id, nome });
    else await createFuncao.mutateAsync(nome);
    setShowFuncaoForm(false);
    setEditFuncao(null);
  };

  const handleDeleteFuncao = async (id: string) => {
    if (!confirm('Excluir esta função?')) return;
    await removeFuncao.mutateAsync(id);
    setFuncaoMenu(null);
  };

  return (
    <AppShell onAddTeam={() => { setEditTeam(null); setShowTeamForm(true); }}>
      {/* Click-away to close menus */}
      {(funcaoMenu || teamMenu) && (
        <div onClick={() => { setFuncaoMenu(null); setTeamMenu(null); }} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
      )}

      <div style={{ padding: '28px 28px', maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Equipes ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#101828' }}>Equipes</h2>
              <div style={{ fontSize: 13, color: '#9AA3B5', marginTop: 2 }}>{teams.length} equipe{teams.length !== 1 ? 's' : ''} cadastrada{teams.length !== 1 ? 's' : ''}</div>
            </div>
            <button
              onClick={() => { setEditTeam(null); setShowTeamForm(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: '0 1px 2px rgba(16,24,40,0.05)', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2E5AAC'; (e.currentTarget as HTMLButtonElement).style.color = '#2E5AAC'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
              Nova Equipe
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,24,40,0.06)' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 100px 48px', padding: '11px 20px', borderBottom: '1px solid #F3F4F6', background: '#FAFBFC' }}>
              {['Equipe', 'Líder', 'Membros', 'Cor', ''].map((h, i) => (
                <div key={i} style={{ fontSize: 11, fontWeight: 600, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
              ))}
            </div>

            {teams.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M23 21V19C23 17.133 21.742 15.55 20 15.12M16 3.13C17.742 3.55 19 5.133 19 7C19 8.867 17.742 10.45 16 10.87M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z" stroke="#9AA3B5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>Nenhuma equipe cadastrada</div>
                <div style={{ fontSize: 13, color: '#9AA3B5' }}>Clique em "Nova Equipe" para começar</div>
              </div>
            ) : teams.map((team, i) => {
              const cl = getColor(team.cor);
              const lider = people.find(p => p.id === team.liderId);
              const memCount = (team.membroIds ?? []).length;
              const isLast = i === teams.length - 1;
              return (
                <div
                  key={team.id}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 100px 48px', padding: '14px 20px', borderBottom: isLast ? 'none' : '1px solid #F3F4F6', alignItems: 'center', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFBFD'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                >
                  {/* Nome */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: cl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: cl.dot }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#101828' }}>{team.nome}</div>
                      {team.descricao && <div style={{ fontSize: 12, color: '#9AA3B5', marginTop: 1, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.descricao}</div>}
                    </div>
                  </div>

                  {/* Líder */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {lider ? (
                      <>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: cl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: cl.dot, flexShrink: 0 }}>{initials(lider.nome)}</div>
                        <span style={{ fontSize: 13, color: '#374151' }}>{lider.nome.split(' ')[0]}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 13, color: '#9AA3B5' }}>—</span>
                    )}
                  </div>

                  {/* Membros */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AvatarStack ids={team.membroIds ?? []} people={people} />
                    {memCount > 0 && <span style={{ fontSize: 12, color: '#9AA3B5' }}>{memCount}</span>}
                  </div>

                  {/* Cor */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    {COLORS.map(cor => {
                      const c = getColor(cor);
                      return (
                        <div key={cor} style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot, opacity: team.cor === cor ? 1 : 0.2 }} />
                      );
                    })}
                  </div>

                  {/* Menu */}
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={e => { e.stopPropagation(); setTeamMenu(teamMenu === team.id ? null : team.id); setFuncaoMenu(null); }}
                      style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: teamMenu === team.id ? '#F3F4F6' : 'transparent', color: '#9AA3B5', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#F3F4F6'}
                      onMouseLeave={e => { if (teamMenu !== team.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >···</button>
                    {teamMenu === team.id && (
                      <div style={{ position: 'absolute', top: 34, right: 0, zIndex: 50, background: '#fff', borderRadius: 10, boxShadow: '0 8px 24px rgba(16,24,40,0.12)', border: '1px solid #E5E7EB', minWidth: 140, overflow: 'hidden' }}>
                        <button onClick={() => { setEditTeam(team); setShowTeamForm(true); setTeamMenu(null); }} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M11 4H4C3.448 4 3 4.448 3 5V20C3 20.552 3.448 21 4 21H19C19.552 21 20 20.552 20 20V13M18.586 2.586C19.367 1.805 20.633 1.805 21.414 2.586C22.195 3.367 22.195 4.633 21.414 5.414L12 14.828L8 16L9.172 12L18.586 2.586Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Editar
                        </button>
                        <div style={{ height: 1, background: '#F3F4F6' }} />
                        <button onClick={() => { handleDeleteTeam(team.id); setTeamMenu(null); }} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#D4537E', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M3 6H5H21M8 6V4C8 3.448 8.448 3 9 3H15C15.552 3 16 3.448 16 4V6M19 6L18.106 19.106C18.047 19.878 17.405 20.478 16.631 20.478H7.369C6.595 20.478 5.953 19.878 5.894 19.106L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Funções ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#101828' }}>Funções</h2>
              <div style={{ fontSize: 13, color: '#9AA3B5', marginTop: 2 }}>{funcoes.length} função{funcoes.length !== 1 ? 'ões' : ''} cadastrada{funcoes.length !== 1 ? 's' : ''}</div>
            </div>
            <button
              onClick={() => { setEditFuncao(null); setShowFuncaoForm(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: '0 1px 2px rgba(16,24,40,0.05)', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2E5AAC'; (e.currentTarget as HTMLButtonElement).style.color = '#2E5AAC'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
              Nova Função
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(16,24,40,0.06)', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 48px', padding: '11px 20px', borderBottom: '1px solid #F3F4F6', background: '#FAFBFC' }}>
              {['Função', 'Membros', ''].map((h, i) => (
                <div key={i} style={{ fontSize: 11, fontWeight: 600, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
              ))}
            </div>

            {funcoes.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M9 6H20M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01" stroke="#9AA3B5" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>Nenhuma função cadastrada</div>
                <div style={{ fontSize: 13, color: '#9AA3B5' }}>Clique em "Nova Função" para começar</div>
              </div>
            ) : funcoes.map((fn, i) => {
              const peopleWithFn = people.filter(p => p.funcoes.includes(fn.nome));
              const isLast = i === funcoes.length - 1;
              return (
                <div
                  key={fn.id}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 120px 48px', padding: '13px 20px', borderBottom: isLast ? 'none' : '1px solid #F3F4F6', alignItems: 'center', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFBFD'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                >
                  {/* Nome */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M9 6H20M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01" stroke="#2E5AAC" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#101828' }}>{fn.nome}</span>
                  </div>

                  {/* Membros */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {peopleWithFn.length > 0 ? (
                      <>
                        <AvatarStack ids={peopleWithFn.map(p => p.id)} people={people} />
                        <span style={{ fontSize: 12, color: '#9AA3B5' }}>{peopleWithFn.length}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 13, color: '#C4C9D4' }}>—</span>
                    )}
                  </div>

                  {/* Menu */}
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={e => { e.stopPropagation(); setFuncaoMenu(funcaoMenu?.id === fn.id ? null : { id: fn.id, x: 0, y: 0 }); setTeamMenu(null); }}
                      style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: funcaoMenu?.id === fn.id ? '#F3F4F6' : 'transparent', color: '#9AA3B5', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#F3F4F6'}
                      onMouseLeave={e => { if (funcaoMenu?.id !== fn.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >···</button>
                    {funcaoMenu?.id === fn.id && (
                      <div style={{ position: 'absolute', top: 34, right: 0, zIndex: 50, background: '#fff', borderRadius: 10, boxShadow: '0 8px 24px rgba(16,24,40,0.12)', border: '1px solid #E5E7EB', minWidth: 140, overflow: 'hidden' }}>
                        <button onClick={() => { setEditFuncao(fn); setShowFuncaoForm(true); setFuncaoMenu(null); }} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M11 4H4C3.448 4 3 4.448 3 5V20C3 20.552 3.448 21 4 21H19C19.552 21 20 20.552 20 20V13M18.586 2.586C19.367 1.805 20.633 1.805 21.414 2.586C22.195 3.367 22.195 4.633 21.414 5.414L12 14.828L8 16L9.172 12L18.586 2.586Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Editar
                        </button>
                        <div style={{ height: 1, background: '#F3F4F6' }} />
                        <button onClick={() => handleDeleteFuncao(fn.id)} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#D4537E', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M3 6H5H21M8 6V4C8 3.448 8.448 3 9 3H15C15.552 3 16 3.448 16 4V6M19 6L18.106 19.106C18.047 19.878 17.405 20.478 16.631 20.478H7.369C6.595 20.478 5.953 19.878 5.894 19.106L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {showTeamForm && (
        <TeamFormDialog
          editTeam={editTeam}
          people={people}
          onClose={() => { setShowTeamForm(false); setEditTeam(null); }}
          onSave={handleSaveTeam}
          onDelete={handleDeleteTeam}
        />
      )}

      {showFuncaoForm && (
        <FuncaoFormDialog
          editNome={editFuncao?.nome}
          onClose={() => { setShowFuncaoForm(false); setEditFuncao(null); }}
          onSave={handleSaveFuncao}
        />
      )}
    </AppShell>
  );
}
