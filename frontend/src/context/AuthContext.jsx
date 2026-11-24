import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

//Ban do React Router tuong ung voi tung role
export const ROLE_ROUTES = {
    Admin: '/admin',
    Manager: '/manager',
    Member: '/member',
    Client: '/client'
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const loginSuccess = (userData, jwtToken) => {
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(jwtToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('nova_token');
        localStorage.removeItem('nova_user');
        setToken(null);
        setUser(null);
    };
    return (
    <AuthContext.Provider value={{ user, token, loading, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);