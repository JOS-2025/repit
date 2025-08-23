import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationBanner from './components/NotificationBanner';
import Home from './pages/Home';
import Browse from './pages/Browse';
import About from './pages/About';
import BecomeFarmer from './pages/BecomeFarmer';
import B2BDashboard from './pages/B2BDashboard';
import { rbac } from './utils/security';

// Mock user data for demonstration - in production, get from authentication
const mockUser = {
  id: 1,
  name: 'Demo User',
  roles: ['customer', 'business'] // Mock roles for testing
};

// Secure Route Component with placeholder auth
const SecureRoute = ({ children, requiredRoles = [], fallback = null }) => {
  // Placeholder authentication check
  const isAuthenticated = true; // In production: check actual auth status
  const user = mockUser; // In production: get from auth context/state
  
  if (!isAuthenticated) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '1rem'
      }}>
        <h2 style={{ color: '#dc2626' }}>🔒 Authentication Required</h2>
        <p>Please log in to access this feature.</p>
        <button 
          style={{
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => alert('Login functionality not implemented yet')}
        >
          Log In
        </button>
      </div>
    );
  }
  
  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => 
      user?.roles?.includes(role)
    );
    
    if (!hasRequiredRole) {
      return fallback || (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          margin: '1rem'
        }}>
          <h2 style={{ color: '#92400e' }}>🚫 Access Restricted</h2>
          <p>You don't have permission to access this feature.</p>
          <p><strong>Required roles:</strong> {requiredRoles.join(', ')}</p>
          <p><strong>Your roles:</strong> {user?.roles?.join(', ') || 'None'}</p>
        </div>
      );
    }
  }
  
  return children;
};

const App = () => {
  return (
    <React.StrictMode>
      <Router>
        <Helmet>
          <title>FramCart - Farm to Table Marketplace</title>
          <meta name="description" content="Connect directly with local farmers for fresh, quality produce delivered to your door" />
          
          {/* Security Headers */}
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
          <meta httpEquiv="X-Frame-Options" content="DENY" />
          <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
          <meta httpEquiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains" />
          
          {/* Content Security Policy */}
          <meta httpEquiv="Content-Security-Policy" content="
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://replit.com;
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com;
            font-src 'self' https://fonts.gstatic.com;
            img-src 'self' data: https:;
            connect-src 'self' https: wss:;
            media-src 'self';
            object-src 'none';
            base-uri 'self';
            form-action 'self';
            frame-ancestors 'none';
            upgrade-insecure-requests;
          " />
          
          {/* Referrer Policy */}
          <meta name="referrer" content="strict-origin-when-cross-origin" />
          
          {/* Additional Security Meta Tags */}
          <meta name="robots" content="index,follow" />
          <meta name="googlebot" content="index,follow" />
        </Helmet>
        
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          
          {/* Show notification banner on home page */}
          <NotificationBanner />
          
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/about" element={<About />} />
              
              {/* Farmer Routes - require farmer role */}
              <Route 
                path="/become-farmer" 
                element={
                  <SecureRoute requiredRoles={[rbac.ROLES.FARMER, rbac.ROLES.ADMIN]}>
                    <BecomeFarmer />
                  </SecureRoute>
                } 
              />
              
              {/* B2B Routes - require business role */}
              <Route 
                path="/b2b-dashboard" 
                element={
                  <SecureRoute 
                    requiredRoles={[rbac.ROLES.BUSINESS, rbac.ROLES.ADMIN]}
                    fallback={
                      <div style={{ 
                        padding: '2rem', 
                        textAlign: 'center',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #3b82f6',
                        borderRadius: '8px',
                        margin: '1rem'
                      }}>
                        <h2 style={{ color: '#1d4ed8' }}>🏢 B2B Dashboard Access</h2>
                        <p>This feature is available for business customers only.</p>
                        <p>Upgrade to a business account to access bulk ordering, volume discounts, and business analytics.</p>
                        <button 
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '500'
                          }}
                          onClick={() => alert('Business registration not implemented yet')}
                        >
                          Register for Business Account
                        </button>
                      </div>
                    }
                  >
                    <B2BDashboard />
                  </SecureRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route 
                path="*" 
                element={
                  <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center',
                    backgroundColor: '#f9fafb',
                    minHeight: '50vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <h1 style={{ fontSize: '4rem', color: '#6b7280', margin: '0' }}>404</h1>
                    <h2 style={{ color: '#374151', marginBottom: '1rem' }}>Page Not Found</h2>
                    <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                      The page you're looking for doesn't exist.
                    </p>
                    <button 
                      style={{
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                      onClick={() => window.location.href = '/'}
                    >
                      Go Home
                    </button>
                  </div>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </React.StrictMode>
  );
};

export default App;