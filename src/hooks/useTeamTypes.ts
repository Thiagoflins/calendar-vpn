import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamTypesService } from '@/services/teamTypesService';

const KEY = ['teamTypes'];

export function useTeamTypes() {
  return useQuery({ queryKey: KEY, queryFn: teamTypesService.list });
}

export function useCreateTeamType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nome: string) => teamTypesService.create(nome),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateTeamType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nome }: { id: string; nome: string }) => teamTypesService.update(id, nome),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRemoveTeamType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamTypesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
