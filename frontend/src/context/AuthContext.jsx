import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check for existing token on load
  useEffect(() => {
    const savedUser = localStorage.getItem('heat_app_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const register = async (name, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('heat_app_user', JSON.stringify(data.user));
        localStorage.setItem('heat_app_token', data.token); // Save the JWT for secure API calls later
        setUser(data.user);
      } else {
        alert(data.message); // In production, replace with a nice UI toast notification
      }
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('heat_app_user', JSON.stringify(data.user));
        localStorage.setItem('heat_app_token', data.token);
        setUser(data.user);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('heat_app_user');
    localStorage.removeItem('heat_app_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};