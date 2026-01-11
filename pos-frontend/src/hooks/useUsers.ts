import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, CreateUserInput } from '@/schemas/user.schema';

interface UsersResponse {
    users: User[];
    count: number;
}

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get<UsersResponse>('/api/users');
            return res.data;
        },
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateUserInput) => {
            const res = await api.post<User>('/api/users', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useDeactivateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await api.put<User>(`/api/users/${id}/deactivate`);
            return res.data;
        },
        onMutate: async (userId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['users'] });

            // Snapshot previous value
            const previousUsers = queryClient.getQueryData<UsersResponse>(['users']);

            // Optimistically update
            if (previousUsers) {
                queryClient.setQueryData<UsersResponse>(['users'], {
                    ...previousUsers,
                    users: previousUsers.users.map((user) =>
                        user.id === userId ? { ...user, is_active: false } : user
                    ),
                });
            }

            return { previousUsers };
        },
        onError: (err, userId, context) => {
            // Rollback on error
            if (context?.previousUsers) {
                queryClient.setQueryData(['users'], context.previousUsers);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
