import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (emailOrUserData, password) => {
        try {
            // If already an authenticated user object (from Google OAuth or direct reset)
            if (typeof emailOrUserData === 'object' && emailOrUserData !== null && emailOrUserData.token) {
                setUser(emailOrUserData);
                localStorage.setItem('userInfo', JSON.stringify(emailOrUserData));
                return { success: true };
            }

            // Normal Email + Password Login
            const { data } = await api.post('/users/login', { email: emailOrUserData, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Check your email and password.',
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await api.post('/users', { name, email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
