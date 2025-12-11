import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // BASE URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor to automatically add token from sessionStorage to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token'); // Token uthao sessionStorage se
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Header mein daal do
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const axiosMethods = {
  get: async (endpoint, params = {}) => {
    try {
      const response = await axiosInstance.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  post: async (endpoint, data) => {
    try {
      const response = await axiosInstance.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  put: async (endpoint, data) => {
    try {
      const response = await axiosInstance.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  },

  delete: async (endpoint, data = {}) => {
    try {
      const response = await axiosInstance.delete(endpoint, { data });
      return response.data;
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  },
};

export default axiosMethods;
