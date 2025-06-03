import { defineStore } from 'pinia';
import axios, { AxiosError } from 'axios'; // Import AxiosError for better type inference
import { ref } from 'vue';
import { API_URL } from '../config'; // Ensure this path is correct relative to this file
import router from '../router'; // Ensure this path is correct relative to this file

/**
 * @interface User
 * @description Defines the structure of a user object received from the backend.
 */
interface User {
  id: string;
  name: string;
  email: string;
  role: string; // e.g., 'admin', 'user', 'guest'
}

/**
 * @interface LoginCredentials
 * @description Defines the structure for user login input.
 */
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * @interface RegisterData
 * @description Defines the structure for user registration input.
 */
interface RegisterData {
  name: string;
  email: string;
  password: string;
}

/**
 * @function useAuthStore
 * @description Pinia store for managing authentication state and actions.
 */
export const useAuthStore = defineStore('auth', () => {
  // State properties
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * @computed isLoggedIn
   * @returns {boolean} True if a token exists, indicating the user is logged in.
   */
  const isLoggedIn = () => !!token.value;

  /**
   * @method setAuthHeader
   * @param {string | null} newToken - The authentication token to set or null to remove.
   * @description Sets or removes the Authorization header for all Axios requests.
   */
  const setAuthHeader = (newToken: string | null) => {
    if (newToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      // Remove the Authorization header if no token is provided
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  /**
   * @method checkAuth
   * @description Checks localStorage for existing authentication data and rehydrates the store state.
   * This should typically be called once when the application initializes (e.g., in main.ts/js).
   */
  const checkAuth = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      token.value = storedToken;
      try {
        // Parse user data from localStorage, handle potential parsing errors
        user.value = JSON.parse(storedUser) as User;
      } catch (e) {
        console.error("Failed to parse user data from localStorage:", e);
        // Clear invalid data if parsing fails
        localStorage.removeItem('user');
        user.value = null;
      }
      setAuthHeader(storedToken);
    }
  };

  /**
   * @method login
   * @param {LoginCredentials} credentials - User's email and password.
   * @returns {Promise<boolean>} True if login was successful, false otherwise.
   * @description Authenticates a user with the backend.
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    loading.value = true;
    error.value = null; // Clear previous errors

    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);

      // Save token and user to state
      token.value = response.data.token;
      user.value = response.data.user;

      // Persist to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Set auth header for subsequent Axios requests
      setAuthHeader(response.data.token);

      // Redirect to dashboard on successful login
      router.push('/dashboard');
      return true;
    } catch (err) {
      // Use AxiosError for better type safety in error handling
      if (axios.isAxiosError(err)) {
        // Access specific error response from backend
        error.value = err.response?.data?.message || 'Login failed. Please check your credentials.';
      } else {
        // Handle generic JavaScript errors
        error.value = 'An unexpected error occurred during login.';
        console.error("Login error:", err);
      }
      return false;
    } finally {
      loading.value = false; // Always reset loading state
    }
  };

  /**
   * @method register
   * @param {RegisterData} data - User's name, email, and password for registration.
   * @returns {Promise<boolean>} True if registration was successful, false otherwise.
   * @description Registers a new user with the backend.
   */
  const register = async (data: RegisterData): Promise<boolean> => {
    loading.value = true;
    error.value = null; // Clear previous errors

    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);

      // Save token and user to state
      token.value = response.data.token;
      user.value = response.data.user;

      // Persist to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Set auth header for subsequent Axios requests
      setAuthHeader(response.data.token);

      // Redirect to dashboard on successful registration
      router.push('/dashboard');
      return true;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        error.value = err.response?.data?.message || 'Registration failed. Please try again.';
      } else {
        error.value = 'An unexpected error occurred during registration.';
        console.error("Registration error:", err);
      }
      return false;
    } finally {
      loading.value = false; // Always reset loading state
    }
  };

  /**
   * @method logout
   * @description Clears authentication state, removes data from localStorage, and redirects to the login page.
   */
  const logout = () => {
    // Clear state
    token.value = null;
    user.value = null;

    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear Axios Authorization header
    setAuthHeader(null);

    // Redirect to login page
    router.push('/login');
  };

  // Expose state and actions from the store
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
