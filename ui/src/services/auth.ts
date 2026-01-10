import config from "../config/api";

export interface LoginResponse {
  id: string;
  isAdmin: boolean;
  name: string;
  subsonicSalt: string;
  subsonicToken: string;
  token: string;
  username: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

const AUTH_STORAGE_KEY = "navidrome_auth";

export const authService = {
  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${config.apiURL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Login failed" }));
      throw new Error(error.error || "Login failed");
    }

    const data: LoginResponse = await response.json();

    // Save to localStorage
    this.saveAuthData(data);

    return data;
  },

  /**
   * Save auth data to localStorage
   */
  saveAuthData(data: LoginResponse): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  },

  /**
   * Get auth data from localStorage
   */
  getAuthData(): LoginResponse | null {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Get auth token
   */
  getToken(): string | null {
    const data = this.getAuthData();
    return data?.token || null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  /**
   * Logout - clear auth data
   */
  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  /**
   * Get user info
   */
  getUser(): LoginResponse | null {
    return this.getAuthData();
  },
};
