'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { availabilityService } from '@/services/availabilityService';
import { Availability } from '@/types';

const KEY = 'availability';

export function useUnavailableOnDate(date: string) {
  return useQuery({
    queryKey: [KEY, 'date', date],
    queryFn: () => availabilityService.listByRange(date, date),
    enabled: !!date,
  });
}

export function useAvailabilityByPerson(pessoaId: string) {
  return useQuery({ queryKey: [KEY, pessoaId], queryFn: () => availabilityService.listByPerson(pessoaId), enabled: !!pessoaId });
}

export function useCreateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: Omit<Availability, 'id'>) => availabilityService.create(item),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRemoveAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => availabilityService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
