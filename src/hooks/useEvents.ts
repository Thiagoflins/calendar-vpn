'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '@/services/eventsService';
import { CalendarEvent, EventType } from '@/types';

const KEY = 'events';

export function useEvents(params?: { from?: string; to?: string; type?: EventType }) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => eventsService.list(params) });
}

export function useEvent(id: string | null) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => eventsService.getById(id!), enabled: !!id });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (event: Omit<CalendarEvent, 'id'>) => eventsService.create(event),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCreateManyEvents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (events: Omit<CalendarEvent, 'id'>[]) => eventsService.createMany(events),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CalendarEvent> }) => eventsService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRemoveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
