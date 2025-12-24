import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token and SaaS context
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add SaaS context headers
        const currentTenant = localStorage.getItem('currentTenant');
        const currentLocation = localStorage.getItem('currentLocation');

        if (currentTenant) {
            const tenant = JSON.parse(currentTenant);
            config.headers['x-tenant-id'] = tenant.id;
        }

        if (currentLocation) {
            const location = JSON.parse(currentLocation);
            config.headers['x-location-id'] = location.id;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only clear session if it's a 401/403 from a protected endpoint (not login)
        if ((error.response?.status === 401 || error.response?.status === 403) &&
            !error.config?.url?.includes('/auth/login')) {
            // Clear auth data and SaaS context, then redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('currentTenant');
            localStorage.removeItem('currentLocation');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
