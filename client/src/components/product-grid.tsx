import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductGridProps {
  products: any[];
  isLoading: boolean;
  showLoginPrompt: boolean;
}

export default function ProductGrid({ products, isLoading, showLoginPrompt }: ProductGridProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string, quantity: number }) => {
      return apiRequest("POST", "/api/cart", { productId, quantity });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product added to cart!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      if (showLoginPrompt) {
        toast({
          title: "Login Required",
          description: "Please login to add products to cart.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
      }
      return;
    }

    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  if (isLoading) {
    return (
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Fresh Arrivals</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Fresh Arrivals</h2>
          {products.length > 8 && (
            <Button variant="ghost" className="text-farm-green hover:text-farm-green-dark">
              View All →
            </Button>
          )}
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-seedling text-6xl text-gray-300 mb-6"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
            <p className="text-gray-500">Check back soon for fresh arrivals from local farmers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <Card 
                key={product.id} 
                className="overflow-hidden hover:shadow-md transition-shadow"
                data-testid={`card-product-${product.id}`}
              >
                <img
                  src={
                    product.images && product.images.length > 0
                      ? product.images[0]
                      : "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                  }
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  data-testid={`img-product-${product.id}`}
                />
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {product.farmer?.isVerified && (
                      <Badge className="bg-farm-green text-white text-xs">
                        Verified
                      </Badge>
                    )}
                    <Badge className="bg-orange-100 text-orange-600 text-xs">
                      Fresh
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1" data-testid={`text-product-name-${product.id}`}>
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2" data-testid={`text-farm-name-${product.id}`}>
                    {product.farmer?.farmName}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-farm-green" data-testid={`text-price-${product.id}`}>
                      KSh {parseFloat(product.price || 0).toLocaleString()}/{product.unit}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={addToCartMutation.isPending}
                      className="bg-farm-green hover:bg-farm-green-dark"
                      data-testid={`button-add-to-cart-${product.id}`}
                    >
                      {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
