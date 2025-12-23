import axios from 'axios';

// Create axios instance with base URL
// In development, this points to localhost:3002 (license server)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
        }
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
