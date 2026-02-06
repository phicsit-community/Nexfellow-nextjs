import api from "../../lib/axios";

/**
 * Token refresh utility
 * Manages token refreshing and authentication state
 */
class TokenRefreshService {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
    this.refreshTimeout = null;
    this.justInitialized = false; // Flag to prevent immediate refresh
    this.accessTokenLifetime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds, matching server setting
  }

  /**
   * Process queue of failed requests
   * @param {string} token - New access token
   * @param {Error} error - Error object if token refresh failed
   */
  processQueue(token = null, error = null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Refresh the access token
   * @returns {Promise} Promise that resolves with the new token
   */
  async refreshToken() {
    try {
      if (this.isRefreshing) {
        // Return a promise that resolves when the token is refreshed
        console.log("Token refresh already in progress, adding to queue");
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        });
      }

      this.isRefreshing = true;

      // Add better error tracking
      let retryAttempt = 0;
      const maxRetries = 2;

      const attemptRefresh = async () => {
        try {
          console.log(
            `Attempting token refresh${retryAttempt > 0 ? ` (retry ${retryAttempt})` : ""
            }`
          );

          const response = await api.post(
            "/auth/refresh-token",
            {},
            {
              withCredentials: true,
              timeout: 30000, // 30 second timeout (for cold starts on Render free tier)
            }
          );

          this.isRefreshing = false;

          if (response.status === 200) {
            // Clear retry count on success
            console.log("Token refreshed successfully");

            // Set up a timer to refresh the token before it expires
            if (this.refreshTimeout) {
              clearTimeout(this.refreshTimeout);
            }

            // Calculate when the token will expire - server may return this
            const expiresAt = response.data.expiresIn
              ? new Date(response.data.expiresIn)
              : new Date(Date.now() + 2 * 60 * 60 * 1000); // Default 2 hours

            const expiresInString = expiresAt.toISOString();

            // Set the timeout to refresh the token 5 minutes before it expires
            const timeUntilRefresh = Math.max(
              0,
              expiresAt.getTime() - Date.now() - 5 * 60 * 1000
            );

            console.log(
              `Scheduling next token refresh in ${Math.floor(
                timeUntilRefresh / 60000
              )} minutes`
            );

            this.refreshTimeout = setTimeout(() => {
              this.refreshToken();
            }, timeUntilRefresh);

            // Store the new expiration time and update login state
            localStorage.setItem("expiresIn", expiresInString);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("lastTokenRefresh", new Date().toISOString());

            // Process the queue of failed requests with the new token
            this.processQueue(response.data);
            return response.data;
          } else {
            console.error("Token refresh failed with status:", response.status);
            this.processQueue(null, new Error("Failed to refresh token"));
            return Promise.reject(new Error("Failed to refresh token"));
          }
        } catch (error) {
          // Categorize errors better
          if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403)
          ) {
            // Authentication error - token is invalid or expired
            console.error(
              "Token refresh failed due to auth error:",
              error.response.status
            );
            this.isRefreshing = false;
            this.processQueue(null, error);

            // Only redirect on explicit auth rejection if on a private route
            // Don't redirect from public pages like landing page
            if (!this.justInitialized) {
              localStorage.setItem("isLoggedIn", "false");
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              localStorage.removeItem("expiresIn");

              // Clear cookies
              document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

              // Don't redirect - let the middleware handle protected routes
              // window.location.href = "/login";
            }
            return Promise.reject(error);
          } else if (error.code === "ECONNABORTED" || !error.response) {
            // Network error - server might be down or network issue
            console.error("Network error during token refresh:", error.message);

            // Retry logic for network errors
            if (retryAttempt < maxRetries) {
              retryAttempt++;
              console.log(
                `Retrying token refresh (${retryAttempt}/${maxRetries})...`
              );
              return new Promise((resolve) => {
                setTimeout(
                  () => resolve(attemptRefresh()),
                  2000 * retryAttempt
                );
              });
            }

            // After max retries, fail but don't log out
            this.isRefreshing = false;
            this.processQueue(null, error);
            return Promise.reject(error);
          } else {
            // Other errors
            console.error("Unknown error during token refresh:", error);
            this.isRefreshing = false;
            this.processQueue(null, error);
            return Promise.reject(error);
          }
        }
      };

      return await attemptRefresh();
    } catch (error) {
      console.error("Fatal error in refresh token flow:", error);
      this.isRefreshing = false;
      this.processQueue(null, error);
      return Promise.reject(error);
    }
  }

  /**
   * Set up axios interceptors to handle token refreshing
   * NOTE: In Next.js, interceptors are handled in lib/axios.js
   * This method is kept for compatibility but does minimal setup
   */
  setupInterceptors() {
    // Interceptors are now handled in lib/axios.js to avoid duplication
    // This method is kept for backward compatibility
    console.log("Token service interceptors are handled in lib/axios.js");
  }

  /**
   * Initialize the token refresh service
   * Should be called when the app starts
   */
  initialize() {
    console.log("Initializing token refresh service");
    this.setupInterceptors();
    this.justInitialized = true;

    // If the user is logged in, set up the refresh timeout with a delay
    if (localStorage.getItem("isLoggedIn") === "true") {
      const expiresIn = localStorage.getItem("expiresIn");

      if (expiresIn) {
        const expiresAt = new Date(expiresIn).getTime();
        const now = Date.now();
        console.log(
          `Token expires at: ${new Date(
            expiresAt
          ).toLocaleString()}, current time: ${new Date(now).toLocaleString()}`
        );

        const timeUntilRefresh = expiresAt - now - 5 * 60 * 1000; // Refresh 5 minutes before expiry

        if (timeUntilRefresh <= 0) {
          // Token is already expired or about to expire, refresh after a short delay
          // This delay prevents immediate refresh that might cause redirect loops
          console.log(
            "Token expired or expiring soon, scheduling refresh after brief delay"
          );
          this.refreshTimeout = setTimeout(() => {
            this.justInitialized = false; // Reset the flag
            this.refreshToken().catch((err) => {
              console.error("Error refreshing token on init:", err.message);
              // Only clear login state for explicit auth errors, not network errors
              if (
                err.response &&
                (err.response.status === 401 || err.response.status === 403)
              ) {
                localStorage.setItem("isLoggedIn", "false");
              }
            });
          }, 3000); // 3 second delay
        } else {
          // Set up timer to refresh token before it expires
          console.log(
            `Token still valid, scheduling refresh in ${Math.floor(
              timeUntilRefresh / 60000
            )} minutes`
          );
          this.refreshTimeout = setTimeout(() => {
            this.justInitialized = false; // Reset the flag
            this.refreshToken().catch((err) => {
              console.error(
                "Error refreshing token on scheduled refresh:",
                err.message
              );
              // Only clear login state for explicit auth errors, not network errors
              if (
                err.response &&
                (err.response.status === 401 || err.response.status === 403)
              ) {
                localStorage.setItem("isLoggedIn", "false");
              }
            });
          }, timeUntilRefresh);
        }
      } else {
        // No expiration time found, try to refresh immediately with a delay
        console.log(
          "No token expiration time found, scheduling immediate refresh"
        );
        this.refreshTimeout = setTimeout(() => {
          this.justInitialized = false; // Reset the flag
          this.refreshToken().catch((err) => {
            console.error(
              "Error refreshing token (no expiry found):",
              err.message
            );
            // Only clear login state for explicit auth errors, not network errors
            if (
              err.response &&
              (err.response.status === 401 || err.response.status === 403)
            ) {
              localStorage.setItem("isLoggedIn", "false");
            }
          });
        }, 3000); // 3 second delay
      }
    } else {
      console.log("User not logged in, skipping token refresh setup");
    }

    // Reset the flag after a delay even if not logged in
    setTimeout(() => {
      this.justInitialized = false;
      console.log("Completed token service initialization");
    }, 5000);
  }
}

// Create singleton instance
const tokenService = new TokenRefreshService();

export default tokenService;
