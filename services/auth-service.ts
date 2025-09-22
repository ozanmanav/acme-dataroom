import { User, LoginCredentials, AuthSession } from "@/types";

// Demo users for authentication (in production, this would be in a database)
const DEMO_USERS: Array<User & { password: string }> = [
  {
    id: "1",
    username: "admin",
    email: "admin@acme.com",
    name: "Admin User",
    role: "admin",
    password: "admin123", // In production, this would be hashed
    createdAt: new Date("2024-01-01"),
    lastLoginAt: new Date(),
  },
  {
    id: "2",
    username: "user",
    email: "user@acme.com",
    name: "Regular User",
    role: "user",
    password: "user123", // In production, this would be hashed
    createdAt: new Date("2024-01-01"),
    lastLoginAt: new Date(),
  },
];

export class AuthService {
  private static readonly TOKEN_KEY = "acme_dataroom_token";
  private static readonly SESSION_KEY = "acme_dataroom_session";

  /**
   * Authenticate user with username and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthSession> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = DEMO_USERS.find(
      (u) =>
        u.username === credentials.username &&
        u.password === credentials.password
    );

    if (!user) {
      throw new Error("Invalid username or password");
    }

    // Create session
    const session: AuthSession = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        lastLoginAt: new Date(),
      },
      token: this.generateToken(user.id),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    // Store session
    this.setSession(session);

    return session;
  }

  /**
   * Logout user and clear session
   */
  static logout(): void {
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.SESSION_KEY);
    }

    // Clear cookies with proper expiration
    this.setCookie(this.TOKEN_KEY, "", -1);
    this.setCookie(this.SESSION_KEY, "", -1);
  }

  /**
   * Get current session
   */
  static getSession(): AuthSession | null {
    if (typeof window === "undefined") return null;

    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      const session: AuthSession = JSON.parse(sessionData);

      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        this.logout();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Get current user
   */
  static getCurrentUser(): User | null {
    const session = this.getSession();
    return session?.user || null;
  }

  /**
   * Validate token
   */
  static validateToken(token: string): boolean {
    const session = this.getSession();
    return session?.token === token;
  }

  /**
   * Refresh session (extend expiry)
   */
  static refreshSession(): AuthSession | null {
    const session = this.getSession();
    if (!session) return null;

    // Extend session by 24 hours
    const refreshedSession: AuthSession = {
      ...session,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    this.setSession(refreshedSession);
    return refreshedSession;
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = DEMO_USERS.find((u) => u.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.password !== currentPassword) {
      throw new Error("Current password is incorrect");
    }

    // Update password (in production, this would update the database)
    user.password = newPassword;
  }

  // Private methods
  private static generateToken(userId: string): string {
    // Simple token generation (in production, use proper JWT)
    return `token_${userId}_${Date.now()}_${Math.random().toString(36)}`;
  }

  private static setSession(session: AuthSession): void {
    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, session.token);
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }

    // Store in cookies for middleware access
    this.setCookie(this.TOKEN_KEY, session.token, 1); // 1 day
    this.setCookie(this.SESSION_KEY, JSON.stringify(session), 1);
  }

  private static setCookie(name: string, value: string, days: number): void {
    if (typeof document !== "undefined") {
      const expires =
        days > 0
          ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
          : "Thu, 01 Jan 1970 00:00:00 UTC";

      document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=strict`;
    }
  }
}
