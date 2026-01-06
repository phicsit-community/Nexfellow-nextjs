import { createSlice } from "@reduxjs/toolkit";
import { initializeSocket, disconnectSocket } from "../../utils/socket";

// Helper to safely access localStorage (SSR-compatible)
const getLocalStorage = (key) => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

const setLocalStorage = (key, value) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};

const removeLocalStorage = (key) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};

// Helper to set cookies (for middleware auth checks)
const setCookie = (name, value, days = 7) => {
  if (typeof window !== "undefined") {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }
};

const removeCookie = (name) => {
  if (typeof window !== "undefined") {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
};

// Helper to check token expiry
const isTokenValid = () => {
  const expiresInStr = getLocalStorage("expiresIn");
  if (!expiresInStr) return false;
  const expiresAt = new Date(expiresInStr);
  return !isNaN(expiresAt) && expiresAt > new Date();
};

// SSR-safe initial state
const getInitialState = () => {
  const isLoggedIn = getLocalStorage("isLoggedIn") === "true";
  const userStr = getLocalStorage("user");
  return {
    isLoggedIn: isLoggedIn && isTokenValid(),
    isAuthLoading: true,
    user: userStr ? JSON.parse(userStr) : null,
    themePreference: getLocalStorage("themePreference") || "light",
  };
};

const initialState = getInitialState();

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

      setLocalStorage("isLoggedIn", "true");
      setCookie("isLoggedIn", "true", 7); // Set cookie for middleware auth
      if (action.payload?.expiresIn) {
        setLocalStorage("expiresIn", action.payload.expiresIn);
      }
      if (action.payload?.user) {
        setLocalStorage("user", JSON.stringify(action.payload.user));
      }

      console.log("User logged in:", action.payload?.user);
      if (action.payload?.user?.id) {
        initializeSocket(action.payload.user.id);
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      setLocalStorage("isLoggedIn", "false");
      removeCookie("isLoggedIn"); // Remove cookie for middleware auth
      removeLocalStorage("user");
      removeLocalStorage("expiresIn");

      disconnectSocket();
    },
    refreshToken: (state, action) => {
      if (action.payload?.expiresIn) {
        setLocalStorage("expiresIn", action.payload.expiresIn);
      }
    },
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        setLocalStorage("user", JSON.stringify(action.payload));
      } else {
        removeLocalStorage("user");
      }
    },
    setThemePreference: (state, action) => {
      state.themePreference = action.payload;
      setLocalStorage("themePreference", action.payload);
    },
    // New action to hydrate state on client mount
    hydrateFromStorage: (state) => {
      if (typeof window !== "undefined") {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const userStr = localStorage.getItem("user");
        state.isLoggedIn = isLoggedIn && isTokenValid();
        state.user = userStr ? JSON.parse(userStr) : null;
        state.themePreference = localStorage.getItem("themePreference") || "light";
        state.isAuthLoading = false;
      }
    },
  },
});

export const { login, logout, refreshToken, setAuthLoading, setUser, setThemePreference, hydrateFromStorage } = authSlice.actions;
export default authSlice.reducer;
