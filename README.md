# ACME Data Room

A modern, secure document management system built with Next.js 15, featuring user authentication, hierarchical file organization, and real-time document preview capabilities.

![ACME Data Room](https://img.shields.io/badge/Next.js-15.5.3-blue) ![React](https://img.shields.io/badge/React-19.1.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.4.3-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4.1.13-blue)

## 🚀 Features

### Authentication & Security

- **Modern Authentication System**: Username/password authentication with session management
- **Route Protection**: Middleware-based route protection with automatic redirects
- **Role-Based Access**: Admin and user roles with different permissions
- **Secure Sessions**: 24-hour sessions with automatic refresh
- **Demo Accounts**: Pre-configured test accounts for immediate testing

### Document Management

- **Hierarchical Organization**: Folder-based file organization with unlimited nesting
- **Drag & Drop Upload**: Modern file upload with progress tracking
- **PDF Preview**: Built-in PDF viewer with zoom and navigation controls
- **Search Functionality**: Real-time search across files and folders
- **Context Menus**: Right-click context menus for file operations

### User Experience

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Form Validation**: Type-safe forms with Zod validation and react-hook-form
- **Modal Management**: Centralized modal state management with Zustand
- **Toast Notifications**: Real-time success/error feedback with Sonner
- **Real-time Feedback**: Loading states, progress indicators, and error handling
- **Keyboard Shortcuts**: Efficient navigation with keyboard support

## 🏗️ Architecture & Design Decisions

### Modern React Patterns

We've implemented several modern React patterns for maintainability and performance:

#### Server Components + Client Islands

- **Server Components**: Static shell components for better performance
- **Client Islands**: Interactive components only where needed
- **Hybrid Rendering**: Optimal balance between SSR and client-side interactivity

#### State Management Strategy

- **Zustand Stores**: Lightweight state management for complex UI state
- **Modal Router Pattern**: Centralized modal management replacing individual UI states
- **React Hook Form**: Performance-optimized form handling with minimal re-renders

#### Type Safety & Validation

- **Zod Schemas**: Runtime validation with TypeScript inference
- **Strict TypeScript**: Comprehensive type coverage across the application
- **Form Validation**: Consistent validation patterns across all forms

### Authentication Architecture

#### Hybrid Session Management

```typescript
// LocalStorage + Cookie approach for optimal compatibility
localStorage: Client-side session persistence
cookies: Server-side middleware access
```

#### Security Features

- **Token-based Authentication**: Secure token generation and validation
- **Automatic Session Refresh**: Prevents unexpected logouts
- **Route Protection**: Middleware-level route guarding
- **Secure Cookie Configuration**: SameSite and expiration settings

### Component Architecture

#### Modular Design

```
components/
├── auth/           # Authentication components
├── data-room/      # Core data room functionality
├── forms/          # Reusable form components
├── modals/         # Modal components with base modal
└── ui/             # Shadcn/ui component library
```

#### Reusable Patterns

- **Base Modal**: Consistent modal behavior across the app
- **Form Fields**: Standardized form field components
- **Context Menus**: Parametric context menu system

## 🛠️ Tech Stack

### Core Framework

- **Next.js 15.5.3**: App Router with React 19 support
- **React 19.1.1**: Latest React with improved concurrent features
- **TypeScript 5.4.3**: Strict type checking and inference

### UI & Styling

- **Tailwind CSS 4.1.13**: Utility-first CSS framework
- **Shadcn/ui**: High-quality component library based on Radix UI
- **Lucide React**: Beautiful, customizable icons
- **Radix UI**: Unstyled, accessible UI primitives

### Forms & Validation

- **React Hook Form 7.62.0**: Performant form library with minimal re-renders
- **Zod 4.1.9**: TypeScript-first schema validation
- **@hookform/resolvers**: Seamless Zod integration

### State Management

- **Zustand 5.0.8**: Lightweight state management
- **React Context**: Authentication state management

### Data & Storage

- **Dexie 4.2.0**: IndexedDB wrapper for client-side storage
- **LocalStorage**: Session persistence
- **Cookies**: Server-side session access

## 📋 Setup Instructions

### Prerequisites

- Node.js 18+
- npm or pnpm
- Modern web browser

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd acme-dataroom
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Access the application**
   - Open http://localhost:3000 in your browser
   - You'll be redirected to the login page

### Demo Accounts

The application comes with pre-configured demo accounts:

| Role  | Username | Password | Description                |
| ----- | -------- | -------- | -------------------------- |
| Admin | `admin`  | `admin`  | Full administrative access |
| User  | `user`   | `user`   | Standard user access       |

### Environment Setup

The application works out of the box with no additional environment configuration required. All authentication is handled locally with demo users.

For production deployment, you would typically:

1. Replace demo users with a real database
2. Implement proper password hashing (bcrypt)
3. Use secure JWT tokens
4. Add environment variables for secrets

## 🎯 Usage Guide

### Authentication Flow

1. Navigate to the application
2. Enter demo credentials on the login page
3. Access the secure data room interface
4. Use the user menu to logout

### File Management

1. **Upload Files**: Click "Upload Files" button or drag & drop PDFs
2. **Create Folders**: Right-click in empty space → "Create Folder"
3. **Navigate**: Use breadcrumbs or double-click folders
4. **File Operations**: Right-click files/folders for context menu

### Search & Navigation

1. **Search**: Use the search bar for real-time filtering
2. **Keyboard Shortcuts**: ESC to close modals, Enter to confirm actions
3. **Breadcrumbs**: Click breadcrumb items for quick navigation

## 🏃‍♂️ Development

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── data-room/         # Data room functionality
│   ├── forms/             # Form components
│   ├── modals/            # Modal components
│   └── ui/                # UI component library
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries and schemas
├── services/              # Business logic and API services
└── types/                 # TypeScript type definitions
```

### Key Files

- `middleware.ts`: Route protection and authentication checks
- `app/layout.tsx`: Root layout with providers
- `components/auth/auth-provider.tsx`: Authentication context
- `services/auth-service.ts`: Authentication business logic
- `lib/auth-schemas.ts`: Zod validation schemas

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Code Style & Patterns

#### Form Components

```typescript
// Standard pattern for form components
const form = useForm<FormData>({
  resolver: zodResolver(validationSchema),
  defaultValues: { ... }
});

const onSubmit = async (data: FormData) => {
  // Handle form submission
};
```

#### Toast Notifications

```typescript
// Use sonner directly for notifications
import { toast } from "sonner";

// Success messages
toast.success("Operation completed", {
  description: "Your action was successful.",
});

// Error messages
toast.error("Operation failed", {
  description: "Please try again later.",
});

// Promise-based operations
toast.promise(apiCall(), {
  loading: "Processing...",
  success: "Operation completed successfully",
  error: "Operation failed",
});
```

#### Modal Components

```typescript
// Use Modal Router for state management
const { openModal, closeModal } = useModalActions();

// Open modals with type-safe props
openModal("createFolder", { existingNames });
```

#### Authentication Checks

```typescript
// Use authentication context
const { isAuthenticated, user, logout } = useAuthContext();

// Check user roles
if (user?.role === "admin") {
  // Admin-only functionality
}
```

## 🔒 Security Considerations

### Current Implementation (Demo)

- Demo users with plaintext passwords
- Client-side session storage
- Basic token generation

### Production Recommendations

- Replace demo users with secure database
- Implement proper password hashing (bcrypt)
- Use secure JWT tokens with proper secrets
- Add rate limiting for authentication attempts
- Implement CSRF protection
- Add audit logging for security events

## 🚀 Deployment

### Build Configuration

The project is configured for standard Next.js deployment:

```javascript
// next.config.js
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
};
```

### Deployment Platforms

- **Vercel**: Zero-config deployment with Next.js
- **Netlify**: Static site hosting with serverless functions
- **Docker**: Containerized deployment for any platform

### Production Checklist

- [ ] Replace demo authentication with real database
- [ ] Implement proper password hashing
- [ ] Add environment variables for secrets
- [ ] Configure proper CORS settings
- [ ] Add monitoring and logging
- [ ] Implement backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the established patterns
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

For questions or issues:

1. Check the existing issues
2. Create a new issue with detailed description
3. Include browser/environment information

---

**Built with ❤️ using modern React patterns and Next.js 15**
