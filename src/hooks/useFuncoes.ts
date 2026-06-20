import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { funcoesService } from '@/services/funcoesService';

const KEY = ['funcoes'];

export function useFuncoes() {
  return useQuery({ queryKey: KEY, queryFn: funcoesService.list, staleTime: Infinity });
}

export function useCreateFuncao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nome: string) => funcoesService.create(nome),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateFuncao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nome }: { id: string; nome: string }) => funcoesService.update(id, nome),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRemoveFuncao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => funcoesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
