import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import SimpleOrderForm from "@/components/simple-order-form";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAddToCart } from '@/components/shopping-cart';
import { sanitizeText, validateLength } from '@/utils/security';

export default function Home() {
  const { toast } = useToast();
  // Don't auto-check auth on public home page - only check when user clicks login
  const { isAuthenticated, isLoading, user } = useAuth(false);

  const { data: products = [], isLoading: productsLoading, error } = useQuery({
    queryKey: ["/api/products"],
    retry: false,
  });

  const productsArray = Array.isArray(products) ? products : [];

  // Handle unauthorized error for products query (but don't redirect)
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      console.log("Products query failed due to auth, but this is a public page");
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Fresh Farm Products
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Order directly from local farmers - Fresh, Local, Affordable
          </p>
          
          {/* Login/Account Info */}
          <div className="mt-8">
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/api/login"
                  className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  data-testid="button-login"
                >
                  🔑 Sign In to Place Orders
                </a>
                <span className="text-green-100 text-sm self-center">
                  Or browse products without signing in
                </span>
              </div>
            ) : (
              <div className="bg-green-700 rounded-lg p-4 inline-block">
                <p className="text-green-100">
                  Welcome back, {user?.firstName || 'User'}! 
                </p>
                <div className="flex gap-2 mt-2 justify-center">
                  <a 
                    href="/orders"
                    className="bg-white text-green-600 px-4 py-2 rounded text-sm hover:bg-gray-100"
                  >
                    My Orders
                  </a>
                  <a 
                    href="/api/logout"
                    className="bg-green-800 text-white px-4 py-2 rounded text-sm hover:bg-green-900"
                  >
                    Sign Out
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Products Section */}
          <div>
            <h2 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-6 text-center">
              Available Products
            </h2>
            
            {productsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
              </div>
            ) : productsArray.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No products available at the moment. Check back soon!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {productsArray.map((product: any) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow" data-testid={`product-${product.id}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-green-600 font-medium">
                              KSh {product.price.toLocaleString()}
                            </span>
                            <span className="text-gray-500">per {product.unit}</span>
                            <span className="text-gray-500">
                              Available: {product.quantity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            By: {product.farmer?.user?.firstName} {product.farmer?.user?.lastName}
                          </p>
                        </div>
                        {product.imageUrl && (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-md ml-4"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Order Form Section */}
          <div className="lg:sticky lg:top-8">
            <SimpleOrderForm products={productsArray} />
          </div>
        </div>
      </div>
    </div>
  );
}
