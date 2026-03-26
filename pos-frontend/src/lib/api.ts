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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Unify the error message from the backend response into standard JS Error universally
        if (error.response?.data) {
            const data = error.response.data;
            if (data.details && Array.isArray(data.details)) {
                // Formatting Zod details nicely
                const fields = data.details.map((d: any) => `${(d.instancePath || '').replace('/', '')}: ${d.message}`).join(', ');
                error.message = `${data.message || 'Validation error'}: ${fields}`;
            } else if (data.message) {
                error.message = data.message;
            } else if (data.error) {
                error.message = data.error;
            }
        } else if (!error.response) {
            error.message = 'Network Error: Cannot reach server';
        }
        return Promise.reject(error);
    }
);

export const voidSale = async (id: string, reason: string, pin?: string) => {
    return api.post(`/api/sales/${id}/void`, { reason, pin });
};

export const openRegister = async (openingAmount: number) => {
    return api.post('/api/register/open', { opening_amount: openingAmount });
};

export const closeRegister = async (closingAmount: number, notes?: string) => {
    return api.post('/api/register/close', { closing_amount: closingAmount, notes });
};

export const getCurrentRegister = async () => {
    return api.get('/api/register/current');
};

export const cashIn = async (amount: number, note?: string) => {
    return api.post('/api/register/cash-in', { amount, note });
};

export const cashOut = async (amount: number, note?: string) => {
    return api.post('/api/register/cash-out', { amount, note });
};

// Tabs
export const createTab = async (data: { customer_name: string; phone?: string; deposit_amount: number }) => {
    return api.post('/api/tabs', data);
};

export const getTabs = async (params?: { q?: string; status?: string }) => {
    return api.get('/api/tabs', { params });
};

export const getTabById = async (id: string) => {
    return api.get(`/api/tabs/${id}`);
};

export const depositToTab = async (id: string, amount: number, note?: string) => {
    return api.post(`/api/tabs/${id}/deposit`, { amount, note });
};

export const closeTab = async (id: string, note?: string) => {
    return api.post(`/api/tabs/${id}/close`, { note });
};

export default api;
