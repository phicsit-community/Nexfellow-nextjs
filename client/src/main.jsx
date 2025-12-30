import React from "react";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import axios from "axios";
import { Provider } from "react-redux";
import { ThemeProvider } from "./hooks/useTheme.jsx";

//store
import { store } from "./store/store.jsx";

//components
import App from "./App.jsx";

//css
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import tokenService from "./utils/auth/tokenService.js";
import { patchConsoleLog } from "./logger";
patchConsoleLog(); // 🧠 Patch early

// Set the base URL for the axios requests
if (import.meta.env.DEV) {
  console.log("Running in development mode");
  axios.defaults.baseURL = import.meta.env.VITE_LOCALHOST;
} else {
  console.log("Running in production mode");
  axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;
}
axios.defaults.withCredentials = true;
axios.defaults.headers.post["Content-Type"] = "application/json";

// Initialize token refresh service
tokenService.initialize();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
