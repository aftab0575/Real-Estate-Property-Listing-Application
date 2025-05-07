import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    axios.defaults.headers.common['x-auth-token'] = token;
                    await fetchUser();
                }
            } catch (err) {
                console.error('Auth check failed:', err);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const fetchUser = async () => {
        try {
            // Parse the JWT token to check if it's admin
            const token = localStorage.getItem('token');
            if (!token) return;

            const decoded = JSON.parse(atob(token.split('.')[1]));
            const userData = decoded.user;

            if (userData.isAdmin) {
                // Admin user
                setUser({
                    id: userData.id,
                    name: userData.name,
                    email: userData.email,
                    isAdmin: true
                });
            } else {
                // Regular user - fetch from API
                const res = await axios.get('http://localhost:5000/api/users/me');
                setUser({
                    ...res.data,
                    isAdmin: false
                });
            }
        } catch (err) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['x-auth-token'];
            setUser(null);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });
            const token = res.data.token;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['x-auth-token'] = token;
            await fetchUser();
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred');
            throw err;
        }
    };

    const register = async (name, email, password) => {
        try {
            setError(null);
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password
            });
            const token = res.data.token;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['x-auth-token'] = token;
            await fetchUser();
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred');
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    const forgotPassword = async (email) => {
        try {
            setError(null);
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred');
            throw err;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                register,
                logout,
                forgotPassword
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 