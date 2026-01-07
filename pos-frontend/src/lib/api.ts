import axios from 'axios';

console.log('API Base URL:', 'http://localhost:3000');
const api = axios.create({
    baseURL: 'http://localhost:3000',
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

export default api;
