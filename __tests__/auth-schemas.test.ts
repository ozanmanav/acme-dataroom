import { loginSchema, registerSchema } from "@/lib/auth-schemas";

describe("auth-schemas.ts", () => {
  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        username: "testuser",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    describe("username validation", () => {
      it("should require username", () => {
        const data = { username: "", password: "password123" };
        const result = loginSchema.safeParse(data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Username is required");
        }
      });

      it("should require minimum 3 characters", () => {
        const data = { username: "ab", password: "password123" };
        const result = loginSchema.safeParse(data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Username must be at least 3 characters"
          );
        }
      });

      it("should limit to 20 characters", () => {
        const data = { username: "a".repeat(21), password: "password123" };
        const result = loginSchema.safeParse(data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Username must be 20 characters or less"
          );
        }
      });

      it("should allow valid characters only", () => {
        const validUsernames = ["user123", "user_name", "user-name", "User123"];
        const invalidUsernames = [
          "user@name",
          "user name",
          "user.name",
          "user#name",
        ];

        validUsernames.forEach((username) => {
          const result = loginSchema.safeParse({
            username,
            password: "password123",
          });
          expect(result.success).toBe(true);
        });

        invalidUsernames.forEach((username) => {
          const result = loginSchema.safeParse({
            username,
            password: "password123",
          });
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].message).toBe(
              "Username can only contain letters, numbers, hyphens and underscores"
            );
          }
        });
      });
    });

    describe("password validation", () => {
      it("should require password", () => {
        const data = { username: "testuser", password: "" };
        const result = loginSchema.safeParse(data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Password is required");
        }
      });

      it("should require minimum 6 characters", () => {
        const data = { username: "testuser", password: "12345" };
        const result = loginSchema.safeParse(data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Password must be at least 6 characters"
          );
        }
      });

      it("should limit to 100 characters", () => {
        const data = { username: "testuser", password: "a".repeat(101) };
        const result = loginSchema.safeParse(data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Password must be 100 characters or less"
          );
        }
      });
    });
  });

  describe("registerSchema", () => {
    it("should validate correct registration data", () => {
      const validData = {
        username: "testuser",
        email: "test@example.com",
        name: "Test User",
        password: "Password123",
        confirmPassword: "Password123",
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should handle optional fields", () => {
      const minimalData = {
        username: "testuser",
        password: "Password123",
        confirmPassword: "Password123",
      };

      const result = registerSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    describe("username validation", () => {
      it("should use same validation as login schema", () => {
        const data = {
          username: "ab",
          password: "Password123",
          confirmPassword: "Password123",
        };
        const result = registerSchema.safeParse(data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Username must be at least 3 characters"
          );
        }
      });
    });

    describe("email validation", () => {
      it("should accept valid email", () => {
        const data = {
          username: "testuser",
          email: "test@example.com",
          password: "Password123",
          confirmPassword: "Password123",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should reject invalid email", () => {
        const data = {
          username: "testuser",
          email: "invalid-email",
          password: "Password123",
          confirmPassword: "Password123",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Please enter a valid email address"
          );
        }
      });
    });

    describe("name validation", () => {
      it("should require name when provided", () => {
        const data = {
          username: "testuser",
          name: "",
          password: "Password123",
          confirmPassword: "Password123",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Name is required");
        }
      });

      it("should limit name to 50 characters", () => {
        const data = {
          username: "testuser",
          name: "a".repeat(51),
          password: "Password123",
          confirmPassword: "Password123",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Name must be 50 characters or less"
          );
        }
      });
    });

    describe("password validation", () => {
      it("should require strong password", () => {
        const weakPasswords = [
          "password", // no uppercase or number
          "PASSWORD", // no lowercase or number
          "Password", // no number
          "password123", // no uppercase
          "PASSWORD123", // no lowercase
        ];

        weakPasswords.forEach((password) => {
          const data = {
            username: "testuser",
            password,
            confirmPassword: password,
          };

          const result = registerSchema.safeParse(data);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].message).toBe(
              "Password must contain at least one lowercase letter, one uppercase letter, and one number"
            );
          }
        });
      });

      it("should accept strong passwords", () => {
        const strongPasswords = ["Password123", "MyPass1", "SecureP4ss"];

        strongPasswords.forEach((password) => {
          const data = {
            username: "testuser",
            password,
            confirmPassword: password,
          };

          const result = registerSchema.safeParse(data);
          expect(result.success).toBe(true);
        });
      });
    });

    describe("password confirmation", () => {
      it("should require password confirmation", () => {
        const data = {
          username: "testuser",
          password: "Password123",
          confirmPassword: "",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Please confirm your password"
          );
        }
      });

      it("should validate passwords match", () => {
        const data = {
          username: "testuser",
          password: "Password123",
          confirmPassword: "DifferentPassword123",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Passwords don't match");
        }
      });
    });
  });
});
