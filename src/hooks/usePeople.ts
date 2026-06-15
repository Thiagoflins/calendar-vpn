'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { peopleService } from '@/services/peopleService';
import { Person } from '@/types';

const KEY = 'people';

export function usePeople(params?: { ativo?: boolean }) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => peopleService.list(params) });
}

export function useCreatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Omit<Person, 'id'>) => peopleService.create(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Person> }) => peopleService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeactivatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => peopleService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRemovePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => peopleService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
