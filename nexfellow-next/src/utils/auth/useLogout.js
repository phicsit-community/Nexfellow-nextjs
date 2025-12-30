import axios from "axios";
import { logout } from "../../store/slices/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

/**
 * Hook to handle logout functionality
 * @returns {Function} logout handler function
 */
const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call server to invalidate refresh token and clear cookies
      await axios.get("/auth/logout", { withCredentials: true });

      // Clear local storage
      localStorage.removeItem("user");
      localStorage.removeItem("expiresIn");
      localStorage.setItem("isLoggedIn", "false");

      // Clear any other app-specific storage
      sessionStorage.clear();

      // For JWT tokens stored in localStorage
      localStorage.removeItem("token");

      // Dispatch logout action to update Redux state
      dispatch(logout());

      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);

      // Fallback: clear client-side auth data even if API call fails
      localStorage.removeItem("user");
      localStorage.removeItem("expiresIn");
      localStorage.removeItem("token");
      localStorage.setItem("isLoggedIn", "false");
      sessionStorage.clear();

      dispatch(logout());
      navigate("/login");
    }
  };

  return handleLogout;
};

export default useLogout;
