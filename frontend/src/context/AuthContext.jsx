import { createContext, useState, useContext, useEffect } from "react";
import {
  loginUser as loginAPI,
  registerUser as registerAPI,
  logoutUser as logoutAPI,
  verifyOTP as verifyOTPAPI,
  sendOTP as sendOTPAPI,
} from "../utils/api";
import { saveUser, getUser, removeUser } from "../utils/localStorage";
import { getCart, saveCart, clearCart } from "../utils/localStorage";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(false); // Không cần loading ban đầu nữa

  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = async (credentials) => {
    try {

      setLoading(true);
      setError(null);

      const data = await loginAPI(credentials);

      saveUser(data.user);

      const guestCart = getCart(null); // null = guest cart
      if (guestCart && guestCart.length > 0) {

        saveCart(guestCart, data.user.id);

        clearCart(null);
      }

      setUser(data.user);

      return data.user;
    } catch (err) {

      setError(err.message || "Đăng nhập thất bại");
      throw err;
    } finally {

      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const data = await registerAPI(userData);

      if (data.requiresVerification) {

        return data;
      }

      saveUser(data.user);
      setUser(data.user);

      return data;
    } catch (err) {
      setError(err.message || "Đăng ký thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      await logoutAPI();

      removeUser();

      setUser(null);
      setError(null);
    } catch (err) {

      console.error("Logout error:", err);
      removeUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const isAdmin = () => {
    return user !== null && user.role === "admin";
  };

  const updateUser = (updatedData) => {
    const updatedUser = {
      ...user,
      ...updatedData,
    };

    saveUser(updatedUser);
    setUser(updatedUser);
  };

  const verifyOTP = async (email, otpCode) => {
    try {
      setLoading(true);
      setError(null);

      const response = await verifyOTPAPI(email, otpCode);

      return response;
    } catch (error) {
      console.error("OTP verification failed:", error);
      setError(error.message || "OTP verification failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const response = await sendOTPAPI(email);

      return response;
    } catch (error) {
      console.error("Send OTP failed:", error);
      setError(error.message || "Send OTP failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {

    user, // User object hoặc null
    loading, // Boolean: đang loading không?
    error, // String: error message (nếu có)

    login, // Function đăng nhập
    register, // Function đăng ký
    verifyOTP, // Function xác thực OTP
    sendOTP, // Function gửi OTP
    logout, // Function đăng xuất
    isAuthenticated, // Function check đã login chưa
    isAdmin, // Function check có phải admin không
    updateUser, // Function cập nhật user info
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export default AuthContext;
