import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../slices/userSlice";
import styles from "./Login.module.css";
import { toast } from "sonner";

// images
import LoginImg from "../../assests/Login/login.svg";
import logo from "../../assests/Navbar/NexFellowLogo.svg";

const Login = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      toast.info("Please enter both email and password.");
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful. Received data:", data);

        dispatch(
          setUser({
            user: data.user,
            token: data.token,
            expiresIn: data.expiresIn,
          })
        );

        localStorage.setItem("token", JSON.stringify(data.token));
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("expiresIn", JSON.stringify(data.expiresIn));

        toast.success("Login successful!");
        navigate("/");
      } else {
        console.error("Login failed. Status:", response.status);
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Login failed. Please try again later.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginContainer}>
        <div className={styles.logo}>
          <img src={logo} alt="NexFellow Logo" />
        </div>
        <div className={styles.loginFormContainer}>
          <div className={styles.loginInfo}>
            <h3>Login</h3>
            <p>Welcome to NexFellow</p>
          </div>

          <div className={styles.loginInputContainer}>
            <div className={styles.inputContainer}>
              <label>
                Email<span className={styles.imp}>*</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className={styles.inputContainer}>
              <label>
                Password<span className={styles.imp}>*</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <div className={styles.loginButtonContainer}>
            <button onClick={handleSubmit}>Log In</button>
          </div>
        </div>
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.info}>
          <img src={LoginImg} alt="Login Illustration" />
        </div>
      </div>
    </div>
  );
};

export default Login;
