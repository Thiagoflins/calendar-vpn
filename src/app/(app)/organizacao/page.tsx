'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { TeamFormDialog } from '@/components/organization/TeamFormDialog';
import { FuncaoFormDialog } from '@/components/organization/FuncaoFormDialog';
import { TeamTypeFormDialog } from '@/components/organization/TeamTypeFormDialog';
import { useTeams, useCreateTeam, useUpdateTeam, useRemoveTeam } from '@/hooks/useTeams';
import { usePeople } from '@/hooks/usePeople';
import { useFuncoes, useCreateFuncao, useUpdateFuncao, useRemoveFuncao } from '@/hooks/useFuncoes';
import { useTeamTypes, useCreateTeamType, useUpdateTeamType, useRemoveTeamType } from '@/hooks/useTeamTypes';
import { Team } from '@/types';
import { getColor, COLORS } from '@/lib/colors';

const PAGE_SIZE = 8;
type TabId = 'equipes' | 'funcoes' | 'tipos';

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
}

function AvatarStack({ ids, people }: { ids: string[]; people: ReturnType<typeof usePeople>['data'] }) {
  const all = people ?? [];
  const members = ids.slice(0, 4).map(id => all.find(p => p.id === id)).filter(Boolean) as typeof all;
  const extra = ids.length - 4;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {members.map((m, i) => (
        <div key={m.id} title={m.nome} style={{ width: 24, height: 24, borderRadius: '50%', background: '#E5E7EB', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#6B7280', marginLeft: i > 0 ? -7 : 0, zIndex: members.length - i, position: 'relative' }}>
          {initials(m.nome)}
        </div>
      ))}
      {extra > 0 && (
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#F3F4F6', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#6B7280', marginLeft: -7, position: 'relative', zIndex: 0 }}>+{extra}</div>
      )}
    </div>
  );
}

function RowMenu({ id, openId, onToggle, children }: { id: string; openId: string | null; onToggle: (id: string | null) => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <button
        onClick={e => { e.stopPropagation(); onToggle(openId === id ? null : id); }}
        style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: openId === id ? '#F3F4F6' : 'transparent', color: '#C4C9D4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLButtonElement).style.color = '#6B7280'; }}
        onMouseLeave={e => { if (openId !== id) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#C4C9D4'; } }}
      >
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
      </button>
      {openId === id && (
        <div style={{ position: 'absolute', top: 32, right: 0, zIndex: 50, background: '#fff', borderRadius: 10, boxShadow: '0 4px 20px rgba(16,24,40,0.10)', border: '1px solid #E5E7EB', minWidth: 148, overflow: 'hidden' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({ onClick, color = '#374151', icon, label }: { onClick: () => void; color?: string; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} style={{ width: '100%', padding: '9px 13px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 400, color, display: 'flex', alignItems: 'center', gap: 8 }}>
      {icon}{label}
    </button>
  );
}

function EditIcon() {
  return <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M11 4H4C3.448 4 3 4.448 3 5V20C3 20.552 3.448 21 4 21H19C19.552 21 20 20.552 20 20V13M18.586 2.586C19.367 1.805 20.633 1.805 21.414 2.586C22.195 3.367 22.195 4.633 21.414 5.414L12 14.828L8 16L9.172 12L18.586 2.586Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function TrashIcon() {
  return <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M3 6H5H21M8 6V4C8 3.448 8.448 3 9 3H15C15.552 3 16 3.448 16 4V6M19 6L18.106 19.106C18.047 19.878 17.405 20.478 16.631 20.478H7.369C6.595 20.478 5.953 19.878 5.894 19.106L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function Divider() { return <div style={{ height: 1, background: '#F5F5F5' }} />; }

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, padding: '12px 20px', borderTop: '1px solid #F3F4F6' }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB', background: page === 1 ? '#F9FAFB' : '#fff', color: page === 1 ? '#C4C9D4' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
      {Array.from({ length: total }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onChange(p)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${p === page ? '#2E5AAC' : '#E5E7EB'}`, background: p === page ? '#2E5AAC' : '#fff', color: p === page ? '#fff' : '#374151', cursor: 'pointer', fontSize: 12, fontWeight: p === page ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p}</button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === total} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB', background: page === total ? '#F9FAFB' : '#fff', color: page === total ? '#C4C9D4' : '#374151', cursor: page === total ? 'not-allowed' : 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
    </div>
  );
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ padding: '52px 20px', textAlign: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 400, color: '#9AA3B5' }}>{label}</div>
    </div>
  );
}

export default function OrganizacaoPage() {
  const { data: teams = [] } = useTeams();
  const { data: people = [] } = usePeople();
  const { data: funcoes = [] } = useFuncoes();
  const { data: teamTypes = [] } = useTeamTypes();

  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const removeTeam = useRemoveTeam();
  const createFuncao = useCreateFuncao();
  const updateFuncao = useUpdateFuncao();
  const removeFuncao = useRemoveFuncao();
  const createTeamType = useCreateTeamType();
  const updateTeamType = useUpdateTeamType();
  const removeTeamType = useRemoveTeamType();

  const [activeTab, setActiveTab] = useState<TabId>('equipes');

  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [showFuncaoForm, setShowFuncaoForm] = useState(false);
  const [editFuncao, setEditFuncao] = useState<{ id: string; nome: string } | null>(null);
  const [showTeamTypeForm, setShowTeamTypeForm] = useState(false);
  const [editTeamType, setEditTeamType] = useState<{ id: string; nome: string } | null>(null);

  const [teamMenu, setTeamMenu] = useState<string | null>(null);
  const [funcaoMenu, setFuncaoMenu] = useState<string | null>(null);
  const [teamTypeMenu, setTeamTypeMenu] = useState<string | null>(null);

  const [teamSearch, setTeamSearch] = useState('');
  const [teamPage, setTeamPage] = useState(1);
  const [funcaoSearch, setFuncaoSearch] = useState('');
  const [funcaoPage, setFuncaoPage] = useState(1);

  const filteredTeams = teams.filter(t => !teamSearch || t.nome.toLowerCase().includes(teamSearch.toLowerCase()) || (t.descricao ?? '').toLowerCase().includes(teamSearch.toLowerCase()));
  const teamTotalPages = Math.max(1, Math.ceil(filteredTeams.length / PAGE_SIZE));
  const pagedTeams = filteredTeams.slice((teamPage - 1) * PAGE_SIZE, teamPage * PAGE_SIZE);

  const filteredFuncoes = funcoes.filter(f => !funcaoSearch || f.nome.toLowerCase().includes(funcaoSearch.toLowerCase()));
  const funcaoTotalPages = Math.max(1, Math.ceil(filteredFuncoes.length / PAGE_SIZE));
  const pagedFuncoes = filteredFuncoes.slice((funcaoPage - 1) * PAGE_SIZE, funcaoPage * PAGE_SIZE);

  const handleSaveTeam = async (data: Omit<Team, 'id'>) => {
    if (editTeam) await updateTeam.mutateAsync({ id: editTeam.id, patch: data });
    else await createTeam.mutateAsync(data);
    setShowTeamForm(false); setEditTeam(null);
  };
  const handleDeleteTeam = async (id: string) => { await removeTeam.mutateAsync(id); setShowTeamForm(false); setEditTeam(null); };

  const handleSaveFuncao = async (nome: string) => {
    if (editFuncao) await updateFuncao.mutateAsync({ id: editFuncao.id, nome });
    else await createFuncao.mutateAsync(nome);
    setShowFuncaoForm(false); setEditFuncao(null);
  };
  const handleDeleteFuncao = async (id: string) => { if (!confirm('Excluir esta função?')) return; await removeFuncao.mutateAsync(id); setFuncaoMenu(null); };

  const handleSaveTeamType = async (nome: string) => {
    if (editTeamType) await updateTeamType.mutateAsync({ id: editTeamType.id, nome });
    else await createTeamType.mutateAsync(nome);
    setShowTeamTypeForm(false); setEditTeamType(null);
  };
  const handleDeleteTeamType = async (id: string) => { if (!confirm('Excluir este tipo?')) return; await removeTeamType.mutateAsync(id); setTeamTypeMenu(null); };

  const closeAllMenus = () => { setTeamMenu(null); setFuncaoMenu(null); setTeamTypeMenu(null); };

  const TABS: { id: TabId; label: string; count: number }[] = [
    { id: 'equipes', label: 'Equipes', count: teams.length },
    { id: 'funcoes', label: 'Funções', count: funcoes.length },
    { id: 'tipos', label: 'Tipos de Equipe', count: teamTypes.length },
  ];

  const addAction = () => {
    if (activeTab === 'equipes') { setEditTeam(null); setShowTeamForm(true); }
    if (activeTab === 'funcoes') { setEditFuncao(null); setShowFuncaoForm(true); }
    if (activeTab === 'tipos') { setEditTeamType(null); setShowTeamTypeForm(true); }
  };

  const addLabel = activeTab === 'equipes' ? 'Equipe' : activeTab === 'funcoes' ? 'Função' : 'Tipo';

  return (
    <AppShell onAddTeam={() => { setEditTeam(null); setShowTeamForm(true); }}>
      {(teamMenu || funcaoMenu || teamTypeMenu) && (
        <div onClick={closeAllMenus} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
      )}

      <div style={{ padding: '28px 28px 80px' }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#101828' }}>Organização</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: '#9AA3B5' }}>Gerencie equipes, funções e categorias do ministério.</p>
        </div>

        {/* ── Stat strip ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Equipes', value: teams.length, color: '#2E5AAC', bg: '#EEF2FF', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M23 21V19C23 17.133 21.742 15.55 20 15.12M16 3.13C17.742 3.55 19 5.133 19 7C19 8.867 17.742 10.45 16 10.87M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z" stroke="#2E5AAC" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg> },
            { label: 'Funções', value: funcoes.length, color: '#6366F1', bg: '#EEF2FF', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 6H20M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01" stroke="#6366F1" strokeWidth="1.7" strokeLinecap="round"/></svg> },
            { label: 'Tipos', value: teamTypes.length, color: '#0891B2', bg: '#ECFEFF', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 7H17M7 12H14M7 17H11M4 4H20V20H4V4Z" stroke="#0891B2" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg> },
          ].map(s => (
            <div key={s.label} onClick={() => setActiveTab(s.label === 'Equipes' ? 'equipes' : s.label === 'Funções' ? 'funcoes' : 'tipos')} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = s.color; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px ${s.color}15`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#101828', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#9AA3B5', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tab bar + action button ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 2, padding: 4, background: '#F3F4F6', borderRadius: 10 }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                  background: activeTab === tab.id ? '#fff' : 'transparent',
                  color: activeTab === tab.id ? '#101828' : '#9AA3B5',
                  boxShadow: activeTab === tab.id ? '0 1px 3px rgba(16,24,40,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
                <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 99, background: activeTab === tab.id ? '#EEF2FF' : '#E5E7EB', color: activeTab === tab.id ? '#2E5AAC' : '#9AA3B5', transition: 'all 0.15s' }}>{tab.count}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search — inline with add button */}
            {activeTab !== 'tipos' && (
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" fill="none" viewBox="0 0 24 24">
                  <path d="M21 21L16.514 16.506M19 11C19 15.418 15.418 19 11 19C6.582 19 3 15.418 3 11C3 6.582 6.582 3 11 3C15.418 3 19 6.582 19 11Z" stroke="#B0B7C3" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  value={activeTab === 'equipes' ? teamSearch : funcaoSearch}
                  onChange={e => { if (activeTab === 'equipes') { setTeamSearch(e.target.value); setTeamPage(1); } else { setFuncaoSearch(e.target.value); setFuncaoPage(1); } }}
                  placeholder={activeTab === 'equipes' ? 'Buscar equipe...' : 'Buscar função...'}
                  style={{ height: 36, padding: '0 12px 0 30px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box', color: '#374151', width: 200 }}
                />
              </div>
            )}
            <button
              onClick={addAction}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, border: 'none', background: '#2E5AAC', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0, height: 36 }}
            >
              <span style={{ fontSize: 17, lineHeight: 1 }}>+</span> {addLabel}
            </button>
          </div>
        </div>

        {/* ── Tab content ── */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'visible', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>

          {/* EQUIPES tab */}
          {activeTab === 'equipes' && (<>
            <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.4fr 1fr 90px 40px', padding: '10px 20px', borderBottom: '1px solid #E5E7EB', background: '#FAFAFA', borderRadius: '12px 12px 0 0' }}>
              {['Equipe', 'Líder', 'Membros', 'Cor', ''].map((h, i) => (
                <div key={i} style={{ fontSize: 11, fontWeight: 500, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>
            {teams.length === 0 ? (
              <EmptyState label="Nenhuma equipe cadastrada" icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M23 21V19C23 17.133 21.742 15.55 20 15.12M16 3.13C17.742 3.55 19 5.133 19 7C19 8.867 17.742 10.45 16 10.87M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z" stroke="#C4C9D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
            ) : pagedTeams.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13, color: '#9AA3B5' }}>Nenhuma equipe encontrada</div>
            ) : pagedTeams.map((team, i) => {
              const cl = getColor(team.cor);
              const lider = people.find(p => p.id === team.liderId);
              const memCount = (team.membroIds ?? []).length;
              const isLast = i === pagedTeams.length - 1;
              return (
                <div key={team.id}
                  style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.4fr 1fr 90px 40px', padding: '11px 20px', borderBottom: isLast && teamTotalPages <= 1 ? 'none' : '1px solid #F5F5F5', alignItems: 'center', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFAFA'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: cl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 11, height: 11, borderRadius: '50%', background: cl.dot }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#18181B' }}>{team.nome}</span>
                        {team.tipo && <span style={{ fontSize: 10, fontWeight: 600, color: '#2E5AAC', background: '#EEF2FF', padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>{team.tipo}</span>}
                      </div>
                      {team.descricao && <div style={{ fontSize: 12, color: '#B0B7C3', marginTop: 1, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.descricao}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {lider ? (<>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: cl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: cl.dot, flexShrink: 0 }}>{initials(lider.nome)}</div>
                      <span style={{ fontSize: 13, color: '#374151' }}>{lider.nome.split(' ')[0]}</span>
                    </>) : <span style={{ fontSize: 13, color: '#C4C9D4' }}>—</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <AvatarStack ids={team.membroIds ?? []} people={people} />
                    {memCount > 0 ? <span style={{ fontSize: 12, color: '#9AA3B5' }}>{memCount}</span> : <span style={{ fontSize: 13, color: '#C4C9D4' }}>—</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {COLORS.map(cor => { const c = getColor(cor); return <div key={cor} style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot, opacity: team.cor === cor ? 1 : 0.18 }} />; })}
                  </div>
                  <RowMenu id={team.id} openId={teamMenu} onToggle={id => { setTeamMenu(id); setFuncaoMenu(null); setTeamTypeMenu(null); }}>
                    <MenuItem onClick={() => { setEditTeam(team); setShowTeamForm(true); setTeamMenu(null); }} icon={<EditIcon />} label="Editar" />
                    <Divider />
                    <MenuItem onClick={() => { handleDeleteTeam(team.id); setTeamMenu(null); }} icon={<TrashIcon />} label="Excluir" color="#EF4444" />
                  </RowMenu>
                </div>
              );
            })}
            <Pagination page={teamPage} total={teamTotalPages} onChange={p => setTeamPage(p)} />
          </>)}

          {/* FUNÇÕES tab */}
          {activeTab === 'funcoes' && (<>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 40px', padding: '10px 20px', borderBottom: '1px solid #E5E7EB', background: '#FAFAFA', borderRadius: '12px 12px 0 0' }}>
              {['Função', 'Membros', ''].map((h, i) => (
                <div key={i} style={{ fontSize: 11, fontWeight: 500, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>
            {funcoes.length === 0 ? (
              <EmptyState label="Nenhuma função cadastrada" icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 6H20M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01" stroke="#C4C9D4" strokeWidth="1.5" strokeLinecap="round"/></svg>} />
            ) : pagedFuncoes.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13, color: '#9AA3B5' }}>Nenhuma função encontrada</div>
            ) : pagedFuncoes.map((fn, i) => {
              const peopleWithFn = people.filter(p => p.funcoes.includes(fn.nome));
              const isLast = i === pagedFuncoes.length - 1;
              return (
                <div key={fn.id}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 200px 40px', padding: '11px 20px', borderBottom: isLast && funcaoTotalPages <= 1 ? 'none' : '1px solid #F5F5F5', alignItems: 'center', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFAFA'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M9 6H20M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01" stroke="#2E5AAC" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#18181B' }}>{fn.nome}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {peopleWithFn.length > 0 ? (<>
                      <AvatarStack ids={peopleWithFn.map(p => p.id)} people={people} />
                      <span style={{ fontSize: 12, color: '#9AA3B5' }}>{peopleWithFn.length} membro{peopleWithFn.length !== 1 ? 's' : ''}</span>
                    </>) : <span style={{ fontSize: 13, color: '#C4C9D4' }}>—</span>}
                  </div>
                  <RowMenu id={fn.id} openId={funcaoMenu} onToggle={id => { setFuncaoMenu(id); setTeamMenu(null); setTeamTypeMenu(null); }}>
                    <MenuItem onClick={() => { setEditFuncao(fn); setShowFuncaoForm(true); setFuncaoMenu(null); }} icon={<EditIcon />} label="Editar" />
                    <Divider />
                    <MenuItem onClick={() => handleDeleteFuncao(fn.id)} icon={<TrashIcon />} label="Excluir" color="#EF4444" />
                  </RowMenu>
                </div>
              );
            })}
            <Pagination page={funcaoPage} total={funcaoTotalPages} onChange={p => setFuncaoPage(p)} />
          </>)}

          {/* TIPOS tab */}
          {activeTab === 'tipos' && (<>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 40px', padding: '10px 20px', borderBottom: '1px solid #E5E7EB', background: '#FAFAFA', borderRadius: '12px 12px 0 0' }}>
              {['Tipo de Equipe', 'Equipes', ''].map((h, i) => (
                <div key={i} style={{ fontSize: 11, fontWeight: 500, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>
            {teamTypes.length === 0 ? (
              <EmptyState label="Nenhum tipo cadastrado" icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M7 7H17M7 12H14M7 17H11M4 4H20V20H4V4Z" stroke="#C4C9D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
            ) : teamTypes.map((tt, i) => {
              const equipeCount = teams.filter(t => t.tipo === tt.nome).length;
              const isLast = i === teamTypes.length - 1;
              return (
                <div key={tt.id}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 160px 40px', padding: '11px 20px', borderBottom: isLast ? 'none' : '1px solid #F5F5F5', alignItems: 'center', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFAFA'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ECFEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M23 21V19C23 17.133 21.742 15.55 20 15.12M16 3.13C17.742 3.55 19 5.133 19 7C19 8.867 17.742 10.45 16 10.87M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z" stroke="#0891B2" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#18181B' }}>{tt.nome}</span>
                  </div>
                  <div style={{ fontSize: 13, color: equipeCount > 0 ? '#374151' : '#C4C9D4' }}>
                    {equipeCount > 0 ? `${equipeCount} equipe${equipeCount !== 1 ? 's' : ''}` : '—'}
                  </div>
                  <RowMenu id={tt.id} openId={teamTypeMenu} onToggle={id => { setTeamTypeMenu(id); setTeamMenu(null); setFuncaoMenu(null); }}>
                    <MenuItem onClick={() => { setEditTeamType(tt); setShowTeamTypeForm(true); setTeamTypeMenu(null); }} icon={<EditIcon />} label="Editar" />
                    <Divider />
                    <MenuItem onClick={() => handleDeleteTeamType(tt.id)} icon={<TrashIcon />} label="Excluir" color="#EF4444" />
                  </RowMenu>
                </div>
              );
            })}
          </>)}

        </div>
      </div>

      {showTeamForm && (
        <TeamFormDialog editTeam={editTeam} people={people} tiposEquipe={teamTypes.map(t => t.nome)}
          onClose={() => { setShowTeamForm(false); setEditTeam(null); }}
          onSave={handleSaveTeam} onDelete={handleDeleteTeam} />
      )}
      {showFuncaoForm && (
        <FuncaoFormDialog editNome={editFuncao?.nome}
          onClose={() => { setShowFuncaoForm(false); setEditFuncao(null); }}
          onSave={handleSaveFuncao} />
      )}
      {showTeamTypeForm && (
        <TeamTypeFormDialog editNome={editTeamType?.nome}
          onClose={() => { setShowTeamTypeForm(false); setEditTeamType(null); }}
          onSave={handleSaveTeamType} />
      )}
    </AppShell>
  );
}
