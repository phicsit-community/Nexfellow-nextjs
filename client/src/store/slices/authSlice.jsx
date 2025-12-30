import { createSlice } from "@reduxjs/toolkit";
import { initializeSocket, disconnectSocket } from "../../utils/socket";

// Helper to check token expiry
const isTokenValid = () => {
  const expiresInStr = localStorage.getItem("expiresIn");
  if (!expiresInStr) return false;
  const expiresAt = new Date(expiresInStr);
  return !isNaN(expiresAt) && expiresAt > new Date();
};

const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const initialState = {
  isLoggedIn: isLoggedIn && isTokenValid(),
  isAuthLoading: true,
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
  themePreference: localStorage.getItem("themePreference") || "light",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthLoading: (state, action) => {
      state.isAuthLoading = action.payload;
    },
    login: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload?.user || null;
      state.themePreference = action.payload?.user?.themePreference || "light";

      localStorage.setItem("isLoggedIn", "true");
      if (action.payload?.expiresIn) {
        localStorage.setItem("expiresIn", action.payload.expiresIn);
      }
      if (action.payload?.user) {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }

      console.log("User logged in:", action.payload?.user);
      if (action.payload?.user?.id) {
        initializeSocket(action.payload.user.id);
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      localStorage.setItem("isLoggedIn", "false");
      localStorage.removeItem("user");
      localStorage.removeItem("expiresIn");

      disconnectSocket();

    },
    refreshToken: (state, action) => {
      if (action.payload?.expiresIn) {
        localStorage.setItem("expiresIn", action.payload.expiresIn);
      }
    },
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("user");
      }
    },
    setThemePreference: (state, action) => {
      state.themePreference = action.payload;
      localStorage.setItem("themePreference", action.payload);
    },
  },
});

export const { login, logout, refreshToken, setAuthLoading, setUser, setThemePreference } = authSlice.actions;
export default authSlice.reducer;
