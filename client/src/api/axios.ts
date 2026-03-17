import axios from 'axios';

// Use the current hostname so it works from both localhost and mobile
const apiHost = window.location.hostname;
const apiUrl = import.meta.env.VITE_API_URL || `http://${apiHost}:5000/api`;

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bts_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bts_token');
      // Optional: redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
