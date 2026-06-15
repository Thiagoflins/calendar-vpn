'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsService } from '@/services/teamsService';
import { Team } from '@/types';

const KEY = 'teams';

export function useTeams() {
  return useQuery({ queryKey: [KEY], queryFn: () => teamsService.list() });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (t: Omit<Team, 'id'>) => teamsService.create(t),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Team> }) => teamsService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRemoveTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
