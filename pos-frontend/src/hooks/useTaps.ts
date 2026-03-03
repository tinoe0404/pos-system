import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Tap } from '@/types/tap';

export const useTaps = () => {
    return useQuery({
        queryKey: ['taps'],
        queryFn: async () => {
            const res = await api.get<Tap[]>('/api/taps');
            return res.data;
        },
        staleTime: 30 * 1000,           // 30 seconds (keg levels change frequently)
        refetchInterval: 60 * 1000,    // Auto-refresh every minute
    });
};
