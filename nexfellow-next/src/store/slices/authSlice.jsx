import { createSlice } from "@reduxjs/toolkit";
import { disconnectSocket } from "../../utils/socket";

// SSR-safe helpers
const getLocalStorage = (key) => {
  if (typeof window !== "undefined") return localStorage.getItem(key);
  return null;
};
const setLocalStorage = (key, value) => {
  if (typeof window !== "undefined") localStorage.setItem(key, value);
};
const removeLocalStorage = (key) => {
  if (typeof window !== "undefined") localStorage.removeItem(key);
};

const clearAllStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.clear();
    sessionStorage.clear();
  }
};

const clearAllCookies = () => {
  if (typeof window !== "undefined") {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }
};

// SSR-safe initial state — Clerk is the source of truth for auth;
// Redux only stores the MongoDB user profile fetched from /auth/getDetails.
const getInitialState = () => {
  const userStr = getLocalStorage("user");
  const isLoggedIn = getLocalStorage("isLoggedIn") === "true";
  return {
    isLoggedIn,
    isAuthLoading: !isLoggedIn, // skip loading spinner if we already have cached session
    user: userStr ? JSON.parse(userStr) : null,
    themePreference: getLocalStorage("themePreference") || "light",
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setAuthLoading: (state, action) => {
      state.isAuthLoading = action.payload;
    },
    login: (state, action) => {
      state.isLoggedIn = true;
      state.isAuthLoading = false;
      state.user = action.payload?.user || null;
      state.themePreference = action.payload?.user?.themePreference || "light";

      if (action.payload?.user) {
        setLocalStorage("user", JSON.stringify(action.payload.user));
        setLocalStorage("isLoggedIn", "true");
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.themePreference = "light";
      state.isAuthLoading = false;

      clearAllStorage();
      clearAllCookies();
      disconnectSocket();
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
    hydrateFromStorage: (state) => {
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("user");
        state.user = userStr ? JSON.parse(userStr) : null;
        state.themePreference = localStorage.getItem("themePreference") || "light";
        state.isAuthLoading = false;
      }
    },
  },
});

export const {
  login,
  logout,
  setAuthLoading,
  setUser,
  setThemePreference,
  hydrateFromStorage,
} = authSlice.actions;

export default authSlice.reducer;
