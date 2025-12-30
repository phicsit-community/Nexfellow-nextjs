import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const SecurePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSecureLink = async () => {
      try {
        const response = await axios.get(`/secure/secure/${token}`, {
          withCredentials: true, // Ensures cookies are sent
        });

        if (response.data.redirect) {
          const redirectUrl = response.data.redirect;

          if (redirectUrl.startsWith("http")) {
            // Use window.location for absolute URLs
            window.location.href = redirectUrl;
          } else {
            // Use navigate for relative URLs within React Router
            navigate(redirectUrl);
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/login"); // Redirect to login if unauthorized
        } else {
          console.error("Error fetching secure link:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecureLink();
  }, [token, navigate]);

  const skeletonStyle = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      width: "100%",
    },
    loader: {
      width: "200px",
      height: "30px",
      borderRadius: "5px",
      background:
        "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
      marginBottom: "20px",
    },
    dot: {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      margin: "0 3px",
      display: "inline-block",
      animation: "pulse 1.5s infinite ease-in-out",
    },
    "@keyframes shimmer": {
      "0%": {
        backgroundPosition: "200% 0",
      },
      "100%": {
        backgroundPosition: "-200% 0",
      },
    },
    "@keyframes pulse": {
      "0%, 100%": {
        opacity: 0.4,
      },
      "50%": {
        opacity: 1,
      },
    },
  };

  return (
    <div>
      {isLoading ? (
        <div style={skeletonStyle.container}>
          <div style={skeletonStyle.loader}></div>
          <div>
            <span
              style={{
                ...skeletonStyle.dot,
                animationDelay: "0s",
                background: "#24b2b4",
              }}
            ></span>
            <span
              style={{
                ...skeletonStyle.dot,
                animationDelay: "0.2s",
                background: "#24b2b4",
              }}
            ></span>
            <span
              style={{
                ...skeletonStyle.dot,
                animationDelay: "0.4s",
                background: "#24b2b4",
              }}
            ></span>
          </div>
          <style>
            {`
                            @keyframes shimmer {
                                0% { background-position: 200% 0; }
                                100% { background-position: -200% 0; }
                            }
                            @keyframes pulse {
                                0%, 100% { opacity: 0.4; }
                                50% { opacity: 1; }
                            }
                        `}
          </style>
        </div>
      ) : (
        <h1>Redirecting...</h1>
      )}
    </div>
  );
};

export default SecurePage;
