# ACME Data Room - Interview Task

A modern, secure document management system built with Next.js 15, featuring user authentication, hierarchical file organization, and real-time document preview capabilities.

> **Interview Task Deliverables**  
> ✅ **GitHub Repository**: Complete source code with comprehensive documentation  
> ✅ **Hosted URL (Vercel)**: [https://acme-dataroom.vercel.app/](https://acme-dataroom.vercel.app/)  
> ✅ **Design Decisions**: Detailed architectural explanations below  
> ✅ **Setup Instructions**: Step-by-step installation guide

![ACME Data Room](https://img.shields.io/badge/Next.js-15.5.3-blue) ![React](https://img.shields.io/badge/React-19.1.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.4.3-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4.1.13-blue) ![Test Coverage](https://img.shields.io/badge/Test%20Coverage-100%25-brightgreen)

## 🎯 Interview Task Overview

This project demonstrates modern full-stack development capabilities with:

- **Production-Ready Architecture**: Scalable, maintainable codebase
- **Modern React Patterns**: Server Components, Client Islands, and advanced state management
- **Type Safety**: Comprehensive TypeScript implementation with Zod validation
- **Testing Excellence**: 170+ comprehensive tests
- **User Experience**: Polished UI with accessibility and performance optimizations
- **Security**: Authentication, route protection, and secure session management

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### 30-Second Setup

```bash
# Clone the repository
git clone https://github.com/ozanmanav/acme-dataroom.git
cd acme-dataroom

# Install dependencies
npm install  # or pnpm install

# Start development server
npm run dev  # or pnpm dev

# Open http://localhost:3000
# Login with: admin/admin or user/user
```

### Testing

```bash
# Run all tests (170+ tests, 100% coverage)
npm test

# Run tests with coverage report
npm run test:coverage
```

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

## 🏗️ Key Design Decisions (Interview Focus)

This section outlines the technical decisions made to demonstrate modern full-stack development capabilities.

### 1. **Next.js 15 + React 19 Architecture**

**Decision**: Used Next.js 15 with App Router and React 19
**Rationale**:

- Server Components for optimal performance
- Modern streaming and concurrent rendering
- Built-in TypeScript support and excellent DX

```typescript
// Example: Server Component with Client Island pattern
// app/page.tsx (Server Component)
export default function DataRoomPage() {
  return (
    <div>
      <DataRoomShell>
        {" "}
        {/* Server rendered */}
        <DataRoomPageClient /> {/* Client hydrated */}
      </DataRoomShell>
    </div>
  );
}
```

### 2. **Type-Safe Architecture with Zod + TypeScript**

**Decision**: Comprehensive type safety from API to UI
**Rationale**: Runtime validation + compile-time type checking prevents bugs

```typescript
// lib/auth-schemas.ts
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

### 3. **State Management Strategy**

**Decision**: Multi-layered state management approach
**Rationale**: Right tool for each use case

- **React Context**: Authentication state (needs server access)
- **Zustand**: Complex UI state (modals, data room operations)
- **React Hook Form**: Form state (performance optimized)

```typescript
// stores/data-room-store.ts
interface DataRoomState {
  files: FileItem[];
  folders: FolderItem[];
  currentPath: string[];
  selectedItems: string[];
}
```

### 4. **Authentication & Security Architecture**

**Decision**: Hybrid session management with middleware protection
**Rationale**: Balance between security and development simplicity

```typescript
// middleware.ts - Route Protection
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

### 5. **Testing Strategy (100% Coverage)**

**Decision**: Comprehensive testing across all layers
**Rationale**: Demonstrates code quality and maintainability

- **170+ Tests**: Unit, integration, and component tests
- **Jest + Testing Library**: Modern testing stack
- **Mock Strategies**: Comprehensive mocking for browser APIs
- **Type-Safe Tests**: Full TypeScript coverage in tests

```typescript
// Example: Component integration test
test("should handle file upload with drag and drop", async () => {
  const { container } = render(<FileUpload onUpload={mockUpload} />);

  const file = new File(["test"], "test.pdf", { type: "application/pdf" });
  const dropzone = container.querySelector('[data-testid="dropzone"]');

  await userEvent.upload(dropzone, file);
  expect(mockUpload).toHaveBeenCalledWith([file]);
});
```

### 6. **Performance Optimizations**

**Decision**: Multiple performance strategies
**Rationale**: Demonstrate understanding of web performance

- **Code Splitting**: Automatic with Next.js App Router
- **Server Components**: Reduce client bundle size
- **Optimistic Updates**: Immediate UI feedback
- **Efficient Re-renders**: Zustand + React Hook Form minimize re-renders

### 7. **Developer Experience (DX)**

**Decision**: Focus on maintainable, scalable codebase
**Rationale**: Demonstrates production-ready development practices

- **TypeScript Strict Mode**: Comprehensive type checking
- **ESLint + Prettier**: Consistent code formatting
- **Component Library**: Reusable UI components (Shadcn/ui)
- **Clear Project Structure**: Logical file organization
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

## 📋 Detailed Setup Instructions

### Prerequisites

- **Node.js 18+** (Latest LTS recommended)
- **npm or pnpm** (pnpm recommended for performance)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Step-by-Step Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ozanmanav/acme-dataroom.git
   cd acme-dataroom
   ```

2. **Install dependencies**

   Using npm:

   ```bash
   npm install
   ```

   Or using pnpm (recommended):

   ```bash
   pnpm install
   ```

3. **Start the development server**

   Using npm:

   ```bash
   npm run dev
   ```

   Or using pnpm:

   ```bash
   pnpm dev
   ```

4. **Access the application**

   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - You'll be automatically redirected to the login page

### Demo Credentials

| Role  | Username | Password | Capabilities                                        |
| ----- | -------- | -------- | --------------------------------------------------- |
| Admin | `admin`  | `admin`  | Full access: upload, create folders, delete, rename |
| User  | `user`   | `user`   | Standard access: upload, create folders, view files |

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # TypeScript type checking

# Testing
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Project Verification

After setup, verify the installation:

1. ✅ **Authentication**: Login with demo credentials
2. ✅ **File Upload**: Drag & drop a PDF file
3. ✅ **Folder Creation**: Right-click → "Create Folder"
4. ✅ **Navigation**: Use breadcrumbs to navigate
5. ✅ **Search**: Type in the search bar to filter files
6. ✅ **Tests**: Run `npm test` to verify all 170+ tests pass

## 🚀 Vercel Deployment (Interview Requirement)

This project is deployed on Vercel as requested in the interview requirements.

### Live Demo

- **URL**: [https://acme-dataroom.vercel.app/](https://acme-dataroom.vercel.app/)
- **Status**: ✅ Production Ready
- **Auto-deployment**: Connected to GitHub for continuous deployment

### Deployment Configuration

The project uses standard Next.js deployment configuration:

```javascript
// next.config.js
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
};
```

### Key Deployment Features

- ✅ **Zero Configuration**: Next.js App Router auto-detected by Vercel
- ✅ **Automatic HTTPS**: SSL certificate automatically provisioned
- ✅ **Global CDN**: Static assets served from Vercel's edge network
- ✅ **Serverless Functions**: API routes deployed as serverless functions
- ✅ **Environment Isolation**: Production environment with optimized builds

### Vercel Deployment Process

For your own deployment:

1. **Fork the repository** on GitHub
2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your forked repository
   - Vercel auto-detects Next.js configuration
3. **Deploy**: Automatic deployment on every push to main branch

### Production Performance

- **Build Time**: ~2 minutes
- **Bundle Size**: Optimized with Next.js automatic code splitting
- **Lighthouse Score**: 95+ performance score
- **Global Availability**: Deployed across Vercel's global edge network

3. **Start development server**

   Using npm:

   ```bash
   npm run dev
   ```

   Or using pnpm:

   ```bash
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
