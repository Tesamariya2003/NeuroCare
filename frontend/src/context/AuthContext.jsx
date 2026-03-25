import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 🔐 Login function
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      setUser(user);

      return {
        success: true,
        role: user.role,
        verification_status: user.verification_status || null,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error || "Login failed",
      };
    }
  };
  // 📝 Register function
  const register = async (formData) => {
    try {
      await api.post("/auth/register", formData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error || "Registration failed",
      };
    }
  };
  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);