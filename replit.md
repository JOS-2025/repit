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

# Privacy & Anonymity Architecture

## Anonymous Browsing Features
FramCart provides comprehensive anonymity features to protect user privacy and enable anonymous shopping without compromising functionality.

## Anonymous Session Management
- **Temporary Sessions**: Anonymous session storage with configurable TTL (default 2 hours)
- **No Permanent Storage**: Session data automatically expires and is cleaned up
- **Anonymous IDs**: Cryptographically secure anonymous session identifiers
- **Data Minimization**: Only essential data stored during anonymous sessions

## Anonymous Shopping Capabilities
- **Anonymous Cart**: Temporary cart storage without user accounts
- **Guest Checkout**: Complete checkout process without registration
- **Anonymous Order Tracking**: Order tracking with temporary anonymous IDs
- **Anonymous Feedback**: Product reviews and feedback without user identification

## Privacy Protection Measures
- **IP Anonymization**: IP addresses masked in logs (last octet removed)
- **User Agent Anonymization**: Browser fingerprints reduced to minimal information
- **Data Sanitization**: Sensitive information automatically redacted from logs
- **Privacy-Safe Error Logging**: Error logs scrubbed of personal information

## Data Retention & Cleanup
- **Automatic Expiry**: Anonymous data expires automatically after sessions
- **Scheduled Cleanup**: Regular cleanup of expired anonymous data
- **Data Rights Compliance**: Support for data deletion and access requests
- **Minimal Data Collection**: Only essential information collected during anonymous browsing

## Anonymous Privacy Controls
- **Privacy Banner**: GDPR-compliant privacy consent with granular controls
- **Anonymous Mode Toggle**: Easy switching between anonymous and regular browsing
- **Privacy Settings Page**: Comprehensive privacy preferences management
- **Privacy Status Indicator**: Visual indicator when in anonymous mode
- **Data Clearing Tools**: Manual data deletion options for users

# WhatsApp Bot Integration

## Real-Time Order Notifications
FramCart features a comprehensive WhatsApp bot integration that provides real-time order notifications and customer support directly through WhatsApp messaging.

## WhatsApp Bot Features
- **Order Confirmations**: Instant confirmation messages when orders are placed
- **Status Updates**: Real-time notifications for order status changes (confirmed, preparing, packed, shipped, delivered)
- **Delivery Notifications**: Driver details and estimated arrival times
- **Payment Reminders**: Automated reminders for pending payments
- **Two-Way Communication**: Customers can interact with the bot for order inquiries
- **Auto-Responses**: Smart responses to common questions and greetings

## Bot Service Architecture
- **Demo Mode**: Console-based simulation for development and testing
- **Production Ready**: Full WhatsApp Web integration with QR code authentication
- **Message Queue**: Reliable message delivery with queue system for offline scenarios
- **Error Handling**: Graceful failure handling that doesn't affect order processing
- **Security**: Phone number validation and sanitization

## Notification Types
- **Order Confirmation**: Detailed order summary with items, total, and delivery info
- **Status Updates**: Emoji-rich status updates with tracking information
- **Delivery Alerts**: Driver contact and real-time delivery updates
- **Support Integration**: Direct connection to customer support through chat

## Technical Implementation
- **WhatsApp Web.js**: Browser automation for WhatsApp integration
- **QR Code Authentication**: Secure connection to WhatsApp Business accounts
- **Message Templates**: Predefined templates for consistent messaging
- **Phone Number Formatting**: Automatic formatting and validation
- **Delivery Tracking**: Integration with order management system

## Customer Experience
- **Mobile-First**: Notifications delivered directly to customers' phones
- **Rich Messaging**: Formatted messages with emojis and clear structure
- **Interactive Support**: Customers can reply to messages for support
- **Opt-in System**: Customers control notification preferences
- **Privacy Protection**: Phone numbers used only for order notifications