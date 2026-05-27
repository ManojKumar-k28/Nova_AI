import { create } from "zustand";
import { AuthState } from "../types";
import { authAPI } from "../services/api";

const getSavedUser = () => {
  const userStr = localStorage.getItem("nova_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

const savedToken = localStorage.getItem("nova_token");

export const useAuthStore = create<AuthState>((set) => ({
  user: getSavedUser(),
  token: savedToken,
  isAuthenticated: !!savedToken,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      // calls authAPI.login
      const data = await authAPI.login(email, password);
      const { token, user } = data;
      
      // stores token and user in localStorage
      localStorage.setItem("nova_token", token);
      localStorage.setItem("nova_user", JSON.stringify(user));
      
      // sets state: token, user, isAuthenticated true
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      // sets isLoading false and throws error if fails
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      // calls authAPI.register
      const data = await authAPI.register(name, email, password);
      const { token, user } = data;
      
      // stores token and user in localStorage
      localStorage.setItem("nova_token", token);
      localStorage.setItem("nova_user", JSON.stringify(user));
      
      // sets state: token, user, isAuthenticated true
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    // removes nova_token and nova_user from localStorage
    localStorage.removeItem("nova_token");
    localStorage.removeItem("nova_user");
    // resets state to unauthenticated
    set({
      token: null,
      user: null,
      isAuthenticated: false
    });
  }
}));
