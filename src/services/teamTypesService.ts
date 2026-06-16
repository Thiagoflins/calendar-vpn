import { TeamType } from '@/types';
import { mockTeamTypesList, mockTeamTypesCreate, mockTeamTypesUpdate, mockTeamTypesRemove } from '@/lib/mock/teamTypes.mock';

export const teamTypesService = {
  async list(): Promise<TeamType[]> {
    return mockTeamTypesList();
  },

  async create(nome: string): Promise<TeamType> {
    return mockTeamTypesCreate(nome);
  },

  async update(id: string, nome: string): Promise<TeamType> {
    return mockTeamTypesUpdate(id, nome);
  },

  async remove(id: string): Promise<void> {
    mockTeamTypesRemove(id);
  },
};
