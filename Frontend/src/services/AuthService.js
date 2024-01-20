import axios from 'axios';

const baseURL = 'http://localhost:4000';

const AuthService = {
    login: async (email, password) => {
        try {
            const response = await axios.post(`${baseURL}/auth/login`, { email, password });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    register: async (email, password, reEnterPassword) => {
        try {
            const response = await axios.post(`${baseURL}/auth/register`, { email, password, reEnterPassword });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    forgotPassword: async (email) => {
        return axios.post(`${baseURL}/auth/forgot-password`, { email });
    },

    resetPassword: async (userId, newPassword, reEnterPassword) => {
        return axios.post(`${baseURL}/auth/reset-password`, { userId, newPassword, reEnterPassword });
    },

    getUserEmail: () => {
        return localStorage.getItem('email');
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    },

    getToken: () => {
        return localStorage.getItem('token');
    }
};

export default AuthService;
