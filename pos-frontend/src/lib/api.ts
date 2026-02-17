import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        try {
            const storage = localStorage.getItem('auth-storage');
            if (storage) {
                const { state } = JSON.parse(storage);
                if (state && state.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            }
        } catch (error) {
            console.error('Failed to parse auth token', error);
        }
    }
    return config;
});

export const voidSale = async (id: string, reason: string, pin?: string) => {
    return api.post(`/sales/${id}/void`, { reason, pin });
};

export const openRegister = async (openingAmount: number) => {
    return api.post('/register/open', { opening_amount: openingAmount });
};

export const closeRegister = async (closingAmount: number, notes?: string) => {
    return api.post('/register/close', { closing_amount: closingAmount, notes });
};

export const getCurrentRegister = async () => {
    return api.get('/register/current');
};

export const cashIn = async (amount: number, note?: string) => {
    return api.post('/register/cash-in', { amount, note });
};

export const cashOut = async (amount: number, note?: string) => {
    return api.post('/register/cash-out', { amount, note });
};

export default api;
