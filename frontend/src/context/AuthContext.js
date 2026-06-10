import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      if (!AsyncStorage) {
        console.warn("AsyncStorage unavailable - user will start unauthenticated");
        setLoading(false);
        return;
      }
      
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (parseError) {
          console.warn("Failed to parse user data:", parseError);
          // Clear corrupted data
          await AsyncStorage.removeItem("user");
          await AsyncStorage.removeItem("token");
        }
      }
    } catch (error) {
      console.error("Load user error:", error?.message || error);
      // App continues with unauthenticated state
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register({ name, email, password });
      if (response.data?.token) {
        try {
          if (AsyncStorage) {
            await AsyncStorage.setItem("token", response.data.token);
            await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
          } else {
            console.warn("AsyncStorage not available - token not saved locally");
          }
        } catch (storageError) {
          console.warn("Failed to save to AsyncStorage:", storageError?.message);
          // Still set user in memory even if storage fails
        }
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: "Registration failed" };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Registration failed",
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      if (response.data?.token) {
        try {
          if (AsyncStorage) {
            await AsyncStorage.setItem("token", response.data.token);
            await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
          } else {
            console.warn("AsyncStorage not available - token not saved locally");
          }
        } catch (storageError) {
          console.warn("Failed to save to AsyncStorage:", storageError?.message);
          // Still set user in memory even if storage fails
        }
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: "Login failed" };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      if (AsyncStorage) {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
      }
    } catch (error) {
      console.warn("Logout: Failed to clear AsyncStorage:", error?.message);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
