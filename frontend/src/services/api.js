import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// CHANGE THIS TO YOUR BACKEND URL
// Android Emulator: http://10.0.2.2:5000/api
// Physical Device: http://YOUR_IP:5000/api
const API_URL = "http://10.0.2.2:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor with proper error handling
api.interceptors.request.use(
  async (config) => {
    try {
      if (!AsyncStorage) {
        console.warn("AsyncStorage not available - skipping token injection");
        return config;
      }
      const token = await AsyncStorage.getItem("token");
      if (token && typeof token === "string") {
        config.headers["x-auth-token"] = token;
      }
    } catch (error) {
      console.warn("Interceptor: Failed to retrieve token:", error?.message || error);
      // Don't fail the request, just continue without token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized: Token may be invalid or expired");
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get("/products/categories/all"),
  getFeatured: () => api.get("/products?featured=true&limit=10"),
  getTrending: () => api.get("/products?trending=true&limit=10"),
};

// Cart APIs
export const cartAPI = {
  get: () => api.get("/cart"),
  add: (productId, quantity) => api.post("/cart", { productId, quantity }),
  update: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  remove: (productId) => api.delete(`/cart/${productId}`),
};

// Order APIs
export const orderAPI = {
  create: (data) => api.post("/orders", data),
  get: () => api.get("/orders"),
};

export default api;
