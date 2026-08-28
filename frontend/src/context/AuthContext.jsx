import { createContext, useEffect, useState } from "react";
import { getMe, login, register, logout } from "../services/auth.api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const data = await getMe();
        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const handleRegister = async (data) => {
    setLoading(true);
    try {
      const res = await register(data);
      setUser(res.user);
      return res;
    } finally { setLoading(false); }
  };

  const handleLogin = async (data) => {
    setLoading(true);
    try {
      const res = await login(data);
      setUser(res.user);
      return res;
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } finally { setLoading(false); }
  };

  return (
    <AuthContext.Provider value={{ user, loading, handleRegister, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}