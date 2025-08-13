// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export default api;