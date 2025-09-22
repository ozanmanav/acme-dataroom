import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

// Mock the auth hook
jest.mock("@/hooks/use-auth");
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock toast
jest.mock("sonner");
const mockToast = toast as jest.Mocked<typeof toast>;

describe("LoginForm", () => {
  const mockLogin = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      user: null,
      logout: jest.fn(),
      refreshSession: jest.fn(),
      changePassword: jest.fn(),
      clearError: jest.fn(),
    });
  });

  it("renders login form correctly", () => {
    render(<LoginForm />);

    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(
      screen.getByText("Sign in to access your data room")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your username")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("shows demo credentials info", () => {
    render(<LoginForm />);

    expect(screen.getByText("Demo Credentials:")).toBeInTheDocument();
    expect(screen.getByText(/Admin:/)).toBeInTheDocument();
    expect(screen.getByText(/User:/)).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const toggleButton = screen.getByRole("button", { name: "" }); // Eye icon button

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Username is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  it("validates username length", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    await user.type(usernameInput, "ab"); // Too short

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Username must be at least 3 characters")
      ).toBeInTheDocument();
    });
  });

  it("validates password length", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    await user.type(usernameInput, "admin");
    await user.type(passwordInput, "123"); // Too short

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters")
      ).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({});

    render(<LoginForm onSuccess={mockOnSuccess} />);

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(usernameInput, "admin");
    await user.type(passwordInput, "admin123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: "admin",
        password: "admin123",
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith("Welcome back!", {
      description: "You have successfully signed in to your account.",
    });
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("redirects to home page when no onSuccess callback", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({});

    render(<LoginForm />);

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(usernameInput, "admin");
    await user.type(passwordInput, "admin123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: "admin",
        password: "admin123",
      });
    });
  });

  it("calls onSuccess callback when provided", async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    mockLogin.mockResolvedValue({});

    render(<LoginForm onSuccess={mockOnSuccess} />);

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(usernameInput, "admin");
    await user.type(passwordInput, "admin123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("handles login error", async () => {
    const user = userEvent.setup();
    const errorMessage = "Invalid credentials";
    mockLogin.mockRejectedValue(new Error(errorMessage));

    render(<LoginForm />);

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(usernameInput, "admin");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Sign in failed", {
        description: errorMessage,
      });
    });
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<LoginForm />);

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(usernameInput, "admin");
    await user.type(passwordInput, "admin123");
    await user.click(submitButton);

    expect(screen.getByText("Signing in...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("displays auth error from useAuth hook", () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: "Session expired",
      isAuthenticated: false,
      user: null,
      logout: jest.fn(),
      refreshSession: jest.fn(),
      changePassword: jest.fn(),
      clearError: jest.fn(),
    });

    render(<LoginForm />);

    expect(screen.getByText("Session expired")).toBeInTheDocument();
  });
});
