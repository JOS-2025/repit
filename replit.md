# Overview

FramCart is a farm-to-table e-commerce platform that connects farmers directly with customers. The application allows farmers to list their fresh produce and customers to browse and purchase items. Key features include farmer registration and verification, product management with image uploads, shopping cart functionality, and order tracking. The platform aims to eliminate intermediaries and provide customers with fresh, locally-sourced agricultural products.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React 18 using Vite as the build tool and bundler. The application uses wouter for client-side routing instead of React Router, providing a lightweight navigation solution. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, styled with Tailwind CSS using CSS variables for theming. React Query (TanStack Query) handles server state management, API calls, and caching. The application follows a component-based architecture with clear separation between pages, reusable components, and UI primitives.

## Backend Architecture
The backend uses Express.js with TypeScript, following a RESTful API design pattern. The server implements middleware for request logging, JSON parsing, and error handling. Authentication is handled through Replit's OpenID Connect (OIDC) system using Passport.js strategies, with session management powered by express-session and PostgreSQL session storage. The API routes are organized in a modular structure with separate concerns for authentication, data operations, and file handling.

## Database Layer
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. Neon is used as the serverless PostgreSQL provider. The database schema includes users, farmers, products, orders, order items, cart items, and sessions tables. Drizzle Kit handles schema migrations and database management. The storage layer implements a repository pattern with an IStorage interface defining all database operations, providing a clean abstraction between the API and database layers.

## Authentication System
Authentication is built around Replit's OIDC provider, creating a seamless experience for users within the Replit ecosystem. The system uses passport-local-strategy with custom verification functions, session-based authentication with PostgreSQL session storage, and automatic user profile updates from OIDC tokens. The authentication flow includes automatic redirects for unauthorized users and proper session management across the application.

## File Management
Product images are handled through multer middleware with local disk storage. Images are stored in an uploads directory with unique filenames generated using timestamps and random strings. The system includes file type validation (images only) and size limits (5MB max). Uploaded images are served as static files through Express.js static middleware.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and schema management

## Authentication Services  
- **Replit OIDC**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware with OIDC strategy

## UI and Styling
- **shadcn/ui**: Pre-built component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom color variables
- **Radix UI**: Headless component primitives for accessibility

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **React Query**: Server state management and API caching

## File Storage
- **Multer**: Express middleware for handling multipart/form-data and file uploads
- **Local File System**: Direct disk storage for product images

# Security Architecture

## Enhanced Enterprise Security Implementation
FramCart implements comprehensive enterprise-grade security measures to protect user data, prevent attacks, and ensure secure transactions.

## Security Headers & Content Security Policy
- **Strict CSP**: Hardened Content Security Policy with minimal permissions, no inline scripts/styles allowed
- **Security Headers**: X-Content-Type-Options (nosniff), X-Frame-Options (DENY), Referrer-Policy (strict-origin-when-cross-origin)
- **Permissions Policy**: Disabled geolocation, camera, microphone, and other sensitive browser APIs
- **HTTPS Enforcement**: Upgrade-insecure-requests directive for secure connections

## Service Worker Security
- **Hardened Service Worker**: Version 2 implementation with enhanced security measures
- **Sensitive Endpoint Protection**: Never caches auth, payment, or admin endpoints (network-only)
- **Cache Security**: Only caches successful same-origin GET requests
- **Push Notification Validation**: Input sanitization and length limits on push data

## Input Validation & Sanitization
- **Client-Side Security Utilities**: Comprehensive input sanitization preventing XSS attacks
- **Form Security**: SecureForm component with automatic validation and rate limiting
- **File Upload Protection**: Type validation, size limits, and malicious filename detection
- **Data Length Validation**: Configurable limits on all user inputs

## Authentication & Authorization
- **Protected Routes**: ProtectedRoute component with role-based access control
- **Session Security**: PostgreSQL-backed sessions with automatic cleanup
- **Rate Limiting**: Client and server-side rate limiting to prevent brute force attacks
- **Role-Based Access**: Farmer, admin, and customer role restrictions

## API Security
- **Request Validation**: express-validator for comprehensive input validation
- **CSRF Protection**: SameSite cookies and token validation
- **Security Monitoring**: Comprehensive logging and security alert system
- **Error Handling**: Secure error responses that don't leak sensitive information

## Security Best Practices
- **Dependency Management**: Regular security audits with npm audit
- **CSP Compliance Validation**: Automatic checking for CSP policy violations
- **Secure Storage**: Client-side data encryption with secure storage utilities
- **Build-Time Security**: Security checks integrated into build process