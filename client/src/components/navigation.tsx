import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import ShoppingCart from "@/components/shopping-cart";
import LanguageToggle from "@/components/language-toggle";
import { useLanguage } from "@/context/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  // Enable auth check in navigation for user menu functionality
  const { user, isAuthenticated, isLoading } = useAuth(true);
  const [location] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Handle login error messages from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
      let message = "Login failed. Please try again.";
      
      switch (error) {
        case 'auth_failed':
          message = "Authentication failed. Please check your credentials.";
          break;
        case 'no_user':
          message = "Login verification failed. Please try again.";
          break;
        case 'session_failed':
          message = "Session creation failed. Please clear cookies and try again.";
          break;
        case 'callback_failed':
          message = "Login callback failed. Please try again later.";
          break;
        default:
          message = "Login failed. Please try again.";
      }
      
      toast({
        title: "Login Error",
        description: message,
        variant: "destructive",
      });
      
      // Clean up URL by removing error parameter
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [toast]);


  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center" data-testid="link-home">
              <i className="fas fa-seedling text-farm-green text-2xl mr-2"></i>
              <span className="text-2xl font-bold text-gray-900">FramCart</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link 
                href="/categories" 
                className={`px-3 py-2 text-sm font-medium ${
                  location === '/categories' 
                    ? 'text-farm-green border-b-2 border-farm-green' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                data-testid="link-categories"
              >
                Categories
              </Link>
              <Link 
                href="/products" 
                className={`px-3 py-2 text-sm font-medium ${
                  location === '/products' 
                    ? 'text-farm-green border-b-2 border-farm-green' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                data-testid="link-products"
              >
                Browse Products
              </Link>
              <Link 
                href="/recommendations" 
                className={`px-3 py-2 text-sm font-medium ${
                  location === '/recommendations' 
                    ? 'text-farm-green border-b-2 border-farm-green' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                data-testid="link-recommendations"
              >
                AI Recommendations
              </Link>
              <Link 
                href="/orders" 
                className={`px-3 py-2 text-sm font-medium ${
                  location === '/orders' 
                    ? 'text-farm-green border-b-2 border-farm-green' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                data-testid="link-orders"
              >
                Track Orders
              </Link>
              <Link 
                href="/community" 
                className={`px-3 py-2 text-sm font-medium ${
                  location === '/community' 
                    ? 'text-farm-green border-b-2 border-farm-green' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                data-testid="link-community"
              >
                Community
              </Link>
              <Link 
                href="/b2b" 
                className={`px-3 py-2 text-sm font-medium ${
                  location.startsWith('/b2b') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                data-testid="link-b2b"
              >
                B2B Solutions
              </Link>
              <Link 
                href="/about" 
                className={`px-3 py-2 text-sm font-medium ${
                  location === '/about' 
                    ? 'text-farm-green border-b-2 border-farm-green' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                data-testid="link-about"
              >
                About
              </Link>
              <Link 
                href="/help" 
                className={`px-3 py-2 text-sm font-medium ${
                  location === '/help' 
                    ? 'text-farm-green border-b-2 border-farm-green' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                data-testid="link-help"
              >
                Help
              </Link>
              <Link 
                href="/terms" 
                className={`px-3 py-2 text-sm font-medium ${
                  location === '/terms' 
                    ? 'text-farm-green border-b-2 border-farm-green' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                data-testid="link-terms"
              >
                Terms
              </Link>
              {user?.farmer && (
                <Link 
                  href="/farmer-dashboard" 
                  className={`px-3 py-2 text-sm font-medium ${
                    location === '/farmer-dashboard' 
                      ? 'text-farm-green border-b-2 border-farm-green' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  data-testid="link-farmer-dashboard"
                >
                  Farmer Dashboard
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {!user.farmer && (
                  <Link href="/farmer-dashboard">
                    <Button 
                      className="bg-farm-green text-white hover:bg-farm-green-dark"
                      data-testid="button-become-farmer"
                    >
                      Become a Farmer
                    </Button>
                  </Link>
                )}
                
                <ShoppingCart onCheckout={() => window.location.href = '/checkout'} />
                
                <LanguageToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                      data-testid="button-user-menu"
                    >
                      {user.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <i className="fas fa-user-circle text-xl"></i>
                      )}
                      <span className="hidden md:block text-sm font-medium text-gray-900">
                        {user.firstName || 'User'}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <i className="fas fa-user mr-2"></i>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <i className="fas fa-cog mr-2"></i>
                      Settings
                    </DropdownMenuItem>
                    {user.farmer && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link href="/farmer-dashboard" className="flex items-center w-full">
                            <i className="fas fa-tractor mr-2"></i>
                            Farmer Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <a 
                        href="/api/logout" 
                        className="flex items-center w-full"
                        data-testid="link-logout"
                      >
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Logout
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="bg-farm-green text-white hover:bg-farm-green-dark"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Loading..." : "Login"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
