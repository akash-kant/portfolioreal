import axios from 'axios';
import toast from 'react-hot-toast';

// Corrected line
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';

    const silentEndpoints = ['/auth/me'];
    const isSilent = silentEndpoints.some((endpoint) => error.config?.url?.includes(endpoint));

    if (!isSilent && error.response?.status !== 401) {
      toast.error(message);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      // Let app router decide navigation; optionally emit an event.
    }

    return Promise.reject(error);
  }
);

export default api;
