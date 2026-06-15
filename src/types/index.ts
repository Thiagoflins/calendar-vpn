export type EventType = 'culto' | 'atividade';
export type EventColor = 'azul' | 'verde' | 'rosa' | 'roxo' | 'laranja' | 'amarelo';
export type RecurrenceType = 'nenhuma' | 'semanal' | 'quinzenal' | 'mensal';
export type CalendarView = 'mes' | 'semana' | 'dia';
export type UserRole = 'admin' | 'lider' | 'membro';

export interface EventTeamGroup {
  responsavel: string;
  membros: string[];
}

export interface CalendarEvent {
  id: string;
  type: EventType;
  nome: string;
  descricao?: string;
  data: string;
  hora: string;
  cor: EventColor;
  observacao?: string;
  pastor?: string;
  adoracao?: EventTeamGroup;
  organizacao?: EventTeamGroup;
  responsavel?: string;
  equipe?: string[];
  repetir?: RecurrenceType;
  repetirQtd?: number;
  recorrenciaOrigem?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface Person {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  funcoes: string[];
  equipeIds: string[];
  ativo: boolean;
  observacao?: string;
  criadoEm?: string;
}

export interface Team {
  id: string;
  nome: string;
  descricao?: string;
  cor?: EventColor;
  liderId?: string;
  membroIds: string[];
  criadoEm?: string;
}

export interface Availability {
  id: string;
  pessoaId: string;
  dataInicio: string;
  dataFim: string;
  motivo?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nome?: string;
  role: UserRole;
}

export type ColorMap = {
  bg: string;
  text: string;
  dot: string;
};
