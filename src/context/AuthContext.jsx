import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            // Optionally, we could fetch user profile here if we didn't store it
            // For now, assume user object is stored in localStorage or fetched elsewhere
            const storedUser = localStorage.getItem('user');
            if (storedUser) setUser(JSON.parse(storedUser));
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
        setIsLoading(false);
    }, [token]);

    useEffect(() => {
        const handleUnauthorized = () => {
            logout();
        };
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    const login = async (email, password) => {
        const data = await apiClient.post('/auth/sign-in', { email, password });
        setToken(data.data.token);
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data;
    };

    const register = async (name, email, password) => {
        const data = await apiClient.post('/auth/sign-up', { name, email, password });
        setToken(data.data.token);
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data;
    };

    const logout = async () => {
        try {
            if (token) await apiClient.post('/auth/sign-out');
        } catch (e) {
            console.error(e);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
