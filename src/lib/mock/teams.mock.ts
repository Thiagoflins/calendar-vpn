import { Team } from '@/types';

export const MOCK_TEAMS: Team[] = [
  { id: 't1', nome: 'Equipe de Louvor', descricao: 'Responsável pela adoração nos cultos', cor: 'verde', liderId: 'p2', membroIds: ['p2', 'p3', 'p4', 'p5', 'p6', 'p9', 'p12'] },
  { id: 't2', nome: 'Equipe de Organização', descricao: 'Coordenação e organização dos cultos', cor: 'laranja', liderId: 'p7', membroIds: ['p7', 'p10'] },
  { id: 't3', nome: 'Equipe de Mídia', descricao: 'Transmissão, projeção e comunicação', cor: 'roxo', liderId: 'p8', membroIds: ['p8'] },
  { id: 't4', nome: 'Equipe de Recepção', descricao: 'Acolhimento e recepção de visitantes', cor: 'amarelo', liderId: 'p7', membroIds: ['p7', 'p11'] },
];
