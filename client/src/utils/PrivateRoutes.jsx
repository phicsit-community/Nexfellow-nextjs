import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

const PrivateRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const expiresInStr = localStorage.getItem("expiresIn");

      let isValid = false;
      if (isLoggedIn && expiresInStr) {
        const expiresAt = new Date(expiresInStr);
        if (!isNaN(expiresAt)) {
          isValid = expiresAt > new Date();
        }
      }

      setIsAuthenticated(isValid);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "5px solid #f3f3f3",
            borderTop: "5px solid #24b2b4",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            `}
        </style>
      </div>
    );
  }

  // Return Outlet if authenticated, otherwise redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
