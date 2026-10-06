import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const err = (e) => {
  if (e.response?.data?.errors) return e.response.data.errors[0].msg;
  return e.response?.data?.message || 'Something went wrong';
};

export const apiErr = err;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const skillAPI = {
  list: (params) => api.get('/skills', { params }),
  categories: () => api.get('/skills/categories'),
  mySkills: (skills) => api.put('/skills/my-skills', { skills }),
  recommend: () => api.get('/skills/recommend'),
};

export const internshipAPI = {
  list: (params) => api.get('/internships', { params }),
  get: (id) => api.get(`/internships/${id}`),
  create: (data) => api.post('/internships', data),
  update: (id, data) => api.put(`/internships/${id}`, data),
  apply: (id, data) => api.post(`/internships/${id}/apply`, data),
};

export const applicationAPI = {
  mine: () => api.get('/applications/my'),
  byInternship: (id) => api.get(`/applications/internship/${id}`),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
};

export const portfolioAPI = {
  get: (userId) => api.get(`/portfolio/${userId}`),
  resume: (url) => api.put('/portfolio/resume', { resumeUrl: url }),
};

export const programAPI = {
  list: (params) => api.get('/programs', { params }),
  create: (data) => api.post('/programs', data),
  enroll: (id) => api.post(`/programs/${id}/enroll`),
};

export const collabAPI = {
  list: (params) => api.get('/collaborations', { params }),
  create: (data) => api.post('/collaborations', data),
  updateStatus: (id, data) => api.put(`/collaborations/${id}/status`, data),
  join: (id) => api.post(`/collaborations/${id}/join`),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
  topSkills: () => api.get('/dashboard/top-skills'),
};

export default api;