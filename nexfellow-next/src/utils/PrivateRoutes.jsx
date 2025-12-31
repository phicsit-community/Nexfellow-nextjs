"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PrivateRoutes = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") return;

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

      // Redirect if not authenticated
      if (!isValid) {
        router.replace("/login");
      }
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
  }, [router]);

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

  // Return children if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default PrivateRoutes;
