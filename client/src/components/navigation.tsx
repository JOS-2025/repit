import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  const cartItemsCount = cartItems.reduce((total: number, item: any) => 
    total + item.quantity, 0
  );

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
                
                <div className="relative">
                  <button 
                    className="text-gray-500 hover:text-gray-700 p-2"
                    data-testid="button-cart"
                  >
                    <i className="fas fa-shopping-cart text-xl"></i>
                    {cartItemsCount > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center p-0 min-w-5"
                        data-testid="badge-cart-count"
                      >
                        {cartItemsCount}
                      </Badge>
                    )}
                  </button>
                </div>

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
