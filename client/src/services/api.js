import axios from 'axios';
import { fetchWithCache } from '../utils/queryCache';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export const getCategories = async () => {
    return fetchWithCache('categories_list', async () => {
        const response = await api.get('/categories');
        return response.data;
    });
};

export default api;
