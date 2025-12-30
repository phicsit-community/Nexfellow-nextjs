// components/ErrorBoundary.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

// Plug in your error reporting service here
function reportError(error, errorInfo) {
  if (import.meta.env.MODE !== "production") {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
}

function getTheme() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
      theme: getTheme(),
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    reportError(error, errorInfo);
  }

  handleReload = () => window.location.reload();

  handleGoHome = () => {
    if (this.props.navigate) {
      this.props.navigate("/");
    } else {
      window.location.href = "/";
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    });
    if (this.props.onReset) this.props.onReset();
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  handleCopy = () => {
    const { error, errorInfo } = this.state;
    const text = `${error?.toString()}\n${errorInfo?.componentStack || ""}`;
    navigator.clipboard.writeText(text);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  render() {
    const { hasError, error, errorInfo, showDetails, copied, theme } =
      this.state;
    const { fallback, supportEmail = "community@nexfellow.com" } = this.props;

    if (hasError) {
      if (fallback) {
        return typeof fallback === "function"
          ? fallback({ error, errorInfo, reset: this.handleReset })
          : fallback;
      }

      const isDark = theme === "dark";
      const bg = isDark ? "#23272f" : "#fff";
      const color = isDark ? "#fff" : "#222";
      const errorColor = isDark ? "#ffb4ab" : "#d32f2f";
      const btnBg = isDark ? "#444" : "#1976d2";
      const btnColor = "#fff";

      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            padding: 32,
            textAlign: "center",
            maxWidth: 600,
            margin: "40px auto",
            background: bg,
            color,
            borderRadius: 12,
            boxShadow: "0 2px 16px rgba(0,0,0,0.09)",
          }}
        >
          <h2 style={{ color: errorColor, marginBottom: 8 }}>
            🚨 Oops! Something went wrong.
          </h2>
          <p style={{ marginBottom: 24 }}>
            An unexpected error occurred. Please try reloading the page or
            contact support if the issue persists.
          </p>
          <div style={{ margin: "24px 0" }}>
            <button
              onClick={this.handleReload}
              style={{
                marginRight: 8,
                padding: "8px 20px",
                background: btnBg,
                color: btnColor,
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
              aria-label="Reload page"
            >
              Reload Page
            </button>
            <button
              onClick={this.handleGoHome}
              style={{
                marginRight: 8,
                padding: "8px 20px",
                background: "#388e3c",
                color: btnColor,
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
              aria-label="Go to home page"
            >
              Go Home
            </button>
            <button
              onClick={this.handleReset}
              style={{
                padding: "8px 20px",
                background: "#757575",
                color: btnColor,
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
              aria-label="Try again"
            >
              Try Again
            </button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={this.toggleDetails}
              style={{
                background: "none",
                border: "none",
                color: btnBg,
                cursor: "pointer",
                textDecoration: "underline",
              }}
              aria-expanded={showDetails}
            >
              {showDetails ? "Hide Details" : "Show Error Details"}
            </button>
            {showDetails && (
              <div style={{ marginTop: 16, textAlign: "left" }}>
                <pre
                  style={{
                    color: errorColor,
                    background: isDark ? "#181a20" : "#f5f5f5",
                    padding: 16,
                    borderRadius: 8,
                    fontSize: 13,
                    maxHeight: 300,
                    overflowX: "auto",
                  }}
                >
                  {error?.toString()}
                  {"\n"}
                  {errorInfo?.componentStack}
                </pre>
                <button
                  onClick={this.handleCopy}
                  style={{
                    marginTop: 8,
                    padding: "6px 14px",
                    background: btnBg,
                    color: btnColor,
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                  aria-label="Copy error details"
                >
                  {copied ? "Copied!" : "Copy Error"}
                </button>
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() =>
                window.open(
                  `mailto:${supportEmail}?subject=App Error&body=Error: ${encodeURIComponent(
                    error?.toString() || ""
                  )}%0A%0AStack:%0A${encodeURIComponent(
                    errorInfo?.componentStack || ""
                  )}`
                )
              }
              style={{
                background: "none",
                border: "none",
                color: btnBg,
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: 15,
              }}
              aria-label="Contact support"
            >
              Contact Support
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Hook to inject navigate for "Go Home" button
function ErrorBoundaryWithNavigate(props) {
  const navigate = useNavigate();
  return <ErrorBoundary {...props} navigate={navigate} />;
}

export default ErrorBoundaryWithNavigate;
