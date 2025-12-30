import { ToastContainer } from "react-toastify";
import axios from "axios";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { initializeSocket } from "./utils/socket";

import AppRoutes from "./routes";
// import ScrollToTop from "./components/Scrolltotop/ScrollToTop";
import { Toaster } from "./components/ui/sonner";
import { ConfigProvider } from "antd";
import MetaTags from "./components/MetaTags/MetaTags";
import tokenService from "./utils/auth/tokenService";

import style from "./App.module.css";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  // Initialize token refresh service when the app mounts
  useEffect(() => {
    console.log("App: Initializing token service");

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const expiresIn = localStorage.getItem("expiresIn");
    let isValid = false;

    if (isLoggedIn && expiresIn) {
      const expiresAt = new Date(expiresIn);
      if (!isNaN(expiresAt)) {
        isValid = expiresAt > new Date();
        console.log(`App: User login state: ${isValid ? "valid" : "expired"}`);
      }
    }

    tokenService.initialize();

    const authCheckInterval = setInterval(() => {
      const currentIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (currentIsLoggedIn) {
        console.log("App: Performing auth heartbeat check");
        axios
          .get("/auth/getDetails", { withCredentials: true })
          .catch((err) => {
            console.log("Auth heartbeat error (non-critical):", err.message);
          });
      }
    }, 15 * 60 * 1000);

    return () => {
      clearInterval(authCheckInterval);
    };
  }, []);

  // Get logged in user from Redux store
  const user = useSelector((state) => state.auth.user);

  // Initialize socket connection on user presence or change
  useEffect(() => {
    if (user?.id) {
      console.log("App: Initializing socket for user:", user.id);
      initializeSocket(user.id);
    }
  }, [user]);

  const defaultTitle = "NexFellow - Bringing Geeks Together";
  const defaultDescription =
    "Join NexFellow to connect with tech enthusiasts, participate in challenges, attend events, and grow your skills in a supportive community.";
  const defaultImage = "https://nexfellow.com/og.png";

  return (
    <div className={style.app}>
      {/* Global default meta tags */}
      <MetaTags
        title={defaultTitle}
        description={defaultDescription}
        image={defaultImage}
        type="website"
      />

      <ToastContainer />
      {/* <ScrollToTop /> */}
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#24b2b4",
          },
        }}
      >
        <AppRoutes />
      </ConfigProvider>
      <Toaster />
      {/* <ThemeFloatingToggle /> */}
    </div>
  );
};

export default App;
