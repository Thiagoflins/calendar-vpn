import { TeamType } from '@/types';

let nextId = 4;

export const MOCK_TEAM_TYPES: TeamType[] = [
  { id: 'tt1', nome: 'Louvor' },
  { id: 'tt2', nome: 'Organização Culto' },
  { id: 'tt3', nome: 'Mídia' },
];

export function mockTeamTypesList(): TeamType[] {
  return [...MOCK_TEAM_TYPES].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function mockTeamTypesCreate(nome: string): TeamType {
  const item: TeamType = { id: `tt${nextId++}`, nome: nome.trim() };
  MOCK_TEAM_TYPES.push(item);
  return item;
}

export function mockTeamTypesUpdate(id: string, nome: string): TeamType {
  const i = MOCK_TEAM_TYPES.findIndex(t => t.id === id);
  if (i === -1) throw new Error('Tipo não encontrado');
  MOCK_TEAM_TYPES[i] = { ...MOCK_TEAM_TYPES[i], nome: nome.trim() };
  return MOCK_TEAM_TYPES[i];
}

export function mockTeamTypesRemove(id: string): void {
  const i = MOCK_TEAM_TYPES.findIndex(t => t.id === id);
  if (i !== -1) MOCK_TEAM_TYPES.splice(i, 1);
}
