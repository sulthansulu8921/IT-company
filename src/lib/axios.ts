import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Only redirect if not already on auth pages, avoiding infinite loops if auth check fails
            if (!window.location.pathname.startsWith('/auth')) {
                localStorage.removeItem('token');
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
