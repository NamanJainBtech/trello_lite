import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
};

export const boardsAPI = {
  getAll: () => API.get('/boards'),
  getById: (id) => API.get(`/boards/${id}`),
  create: (boardData) => API.post('/boards', boardData),
  update: (id, boardData) => API.put(`/boards/${id}`, boardData),
  delete: (id) => API.delete(`/boards/${id}`),
};

export const columnsAPI = {
  create: (columnData) => API.post('/columns', columnData),
  update: (id, columnData) => API.put(`/columns/${id}`, columnData),
  delete: (id) => API.delete(`/columns/${id}`),
};

export const tasksAPI = {
  create: (taskData) => API.post('/tasks', taskData),
  update: (id, taskData) => API.put(`/tasks/${id}`, taskData),
  move: (id, moveData) => API.put(`/tasks/${id}/move`, moveData),
  delete: (id) => API.delete(`/tasks/${id}`),
};

export const usersAPI = {
  updateTheme: (themeData) => API.put('/users/theme', themeData),
  getProfile: () => API.get('/users/profile'),
};

export default API;