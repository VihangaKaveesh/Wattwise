import api from './api';

// --- Login Function ---
const login = async (email, password) => {
  try {
    // Send the email and password to the backend login endpoint
    const { data } = await api.post('/users/login', { email, password });

    // If the login is successful, backend sends user data with a token.
    // We save this data in the browser's local storage.
    if (data && data.token) {
      localStorage.setItem('userInfo', JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    // If login fails, the backend sends an error message. We pass it on.
    throw error.response?.data?.message || 'An unknown error occurred';
  }
};

// --- Logout Function ---
const logout = () => {
  localStorage.removeItem('userInfo');
  window.location.href = '/login'; // Redirect to login page
};

// --- Register Function ---
const register = async (name, email, password) => {
  try {
    // Send name, email, and password to the backend register endpoint
    const { data } = await api.post('/users/register', { name, email, password });

    // After successful registration, automatically log the user in
    // by saving their data to local storage.
    if (data && data.token) {
      localStorage.setItem('userInfo', JSON.stringify(data));
    }
    return data;
  } catch (error) {
    // Pass on any error messages from the backend
    throw error.response?.data?.message || 'An unknown error occurred';
  }
};

// --- Export for use in our components ---
export const authService = {
  login,
  logout,
  register,
};

