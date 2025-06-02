import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { API_URL } from '../config';
import router from '../router';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isLoggedIn = () => !!token.value;

  const setAuthHeader = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const checkAuth = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
      setAuthHeader(storedToken);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      // Save token and user to state
      token.value = response.data.token;
      user.value = response.data.user;
      
      // Save to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set auth header for axios
      setAuthHeader(response.data.token);
      
      // Redirect
      router.push('/dashboard');
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const register = async (data: RegisterData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);
      
      token.value = response.data.token;
      user.value = response.data.user;
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setAuthHeader(response.data.token);
      router.push('/dashboard');
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

const logout = () => {
  token.value = null;
  user.value = null;

  localStorage.removeItem('token');
  localStorage.removeItem('user');

  setAuthHeader(null);

  // ✅ Redirect to login page
  router.push('/login');
};


  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    checkAuth,
    login,
    register,
    logout
  };
});
