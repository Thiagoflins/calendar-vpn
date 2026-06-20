import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/authService';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 1000 * 60 * 5,
  });
}
