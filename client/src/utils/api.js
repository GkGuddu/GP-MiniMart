import axios from 'axios';

// Get base API URL dynamically based on environment
const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // If running in production (e.g. Vercel) and VITE_API_URL is missing, avoid http://localhost:5000 Mixed Content block
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return 'https://gp-minimart-backend.onrender.com/api';
    }
    return 'http://localhost:5000/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const { token } = JSON.parse(userInfo);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (e) {
                console.error('Invalid token JSON', e);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
