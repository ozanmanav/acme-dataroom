import { AuthService } from "@/services/auth-service";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Replace global localStorage
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock document.cookie
Object.defineProperty(document, "cookie", {
  writable: true,
  value: "",
});

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();

    // Reset document.cookie
    document.cookie = "";
  });

  describe("login", () => {
    it("should login with valid credentials", async () => {
      const credentials = { username: "admin", password: "admin123" };

      const session = await AuthService.login(credentials);

      expect(session).toMatchObject({
        user: {
          username: "admin",
          role: "admin",
        },
        token: expect.any(String),
        expiresAt: expect.any(Date),
      });
    });

    it("should reject invalid credentials", async () => {
      const credentials = { username: "invalid", password: "wrong" };

      await expect(AuthService.login(credentials)).rejects.toThrow(
        "Invalid username or password"
      );
    });

    it("should reject wrong password", async () => {
      const credentials = { username: "admin", password: "wrongpassword" };

      await expect(AuthService.login(credentials)).rejects.toThrow(
        "Invalid username or password"
      );
    });
  });

  describe("logout", () => {
    it("should clear session data", () => {
      AuthService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "acme_dataroom_token"
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "acme_dataroom_session"
      );
    });
  });

  describe("getSession", () => {
    it("should return null when no session exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const session = AuthService.getSession();

      expect(session).toBeNull();
    });

    it("should return session when valid session exists", () => {
      const mockSession = {
        user: { id: "1", username: "admin", role: "admin" },
        token: "mock-token",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession));

      const session = AuthService.getSession();

      expect(session).toMatchObject({
        user: mockSession.user,
        token: mockSession.token,
      });
    });

    it("should return null and logout when session is expired", () => {
      const expiredSession = {
        user: { id: "1", username: "admin", role: "admin" },
        token: "mock-token",
        expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired 1 second ago
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSession));

      const session = AuthService.getSession();

      expect(session).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when valid session exists", () => {
      const mockSession = {
        user: { id: "1", username: "admin", role: "admin" },
        token: "mock-token",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession));

      expect(AuthService.isAuthenticated()).toBe(true);
    });

    it("should return false when no session exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(AuthService.isAuthenticated()).toBe(false);
    });
  });

  describe("validateToken", () => {
    it("should return true for valid token", () => {
      const mockSession = {
        user: { id: "1", username: "admin", role: "admin" },
        token: "valid-token",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession));

      expect(AuthService.validateToken("valid-token")).toBe(true);
    });

    it("should return false for invalid token", () => {
      const mockSession = {
        user: { id: "1", username: "admin", role: "admin" },
        token: "valid-token",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession));

      expect(AuthService.validateToken("invalid-token")).toBe(false);
    });
  });
});
