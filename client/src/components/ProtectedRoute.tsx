import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireFarmer?: boolean;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Protected route component that handles authentication and authorization
 */
export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireFarmer = false,
  requireAdmin = false,
  fallback = null 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [accessGranted, setAccessGranted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = () => {
      // If still loading, wait
      if (isLoading) {
        setAccessGranted(null);
        return;
      }

      // Check basic authentication requirement
      if (requireAuth && !isAuthenticated) {
        setAccessGranted(false);
        toast({
          title: "Authentication Required",
          description: "Please sign in to access this page.",
          variant: "destructive",
        });
        // Redirect to login after a brief delay
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
        return;
      }

      // Check farmer role requirement
      if (requireFarmer && (!user?.farmer)) {
        setAccessGranted(false);
        toast({
          title: "Farmer Access Required",
          description: "This page is only accessible to registered farmers.",
          variant: "destructive",
        });
        return;
      }

      // Check admin role requirement
      if (requireAdmin && (!user?.email?.endsWith('@framcart.admin'))) {
        setAccessGranted(false);
        toast({
          title: "Admin Access Required",
          description: "This page is only accessible to administrators.",
          variant: "destructive",
        });
        return;
      }

      // All checks passed
      setAccessGranted(true);
    };

    checkAccess();
  }, [isAuthenticated, isLoading, user, requireAuth, requireFarmer, requireAdmin, toast]);

  // Show loading state
  if (isLoading || accessGranted === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-gray-600">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied
  if (!accessGranted) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    );
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * Higher-order component for protecting routes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}