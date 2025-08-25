import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PriceComparison from "@/components/price-comparison";
import SubscriptionOrders from "@/components/subscription-orders";
import { BulkPricing } from "@/components/bulk-pricing";

// Flexible product interface that handles various data types
interface FlexibleProduct {
  id: string;
  name?: string;
  description?: string;
  price?: string | number;
  category?: string;
  unit?: string;
  availableQuantity?: number;
  images?: string[] | string;
  farmerId?: string;
  farmer?: {
    id?: string;
    farmName?: string;
    location?: string;
    averageRating?: string | number;
    isVerified?: boolean;
  } | null;
  // Additional flexible properties
  [key: string]: any;
}

interface ProductGridProps {
  products: FlexibleProduct[];
  isLoading: boolean;
  showLoginPrompt: boolean;
}

// Helper function to normalize product data
const normalizeProduct = (product: any): FlexibleProduct => {
  return {
    id: product.id || product._id || String(Math.random()),
    name: product.name || product.title || product.productName || 'Unnamed Product',
    description: product.description || product.desc || '',
    price: product.price || product.cost || product.amount || 0,
    category: product.category || product.type || 'other',
    unit: product.unit || product.unitType || 'piece',
    availableQuantity: product.availableQuantity || product.quantity || product.stock || 0,
    images: Array.isArray(product.images) ? product.images : 
            (product.images ? [product.images] : 
            (product.image ? [product.image] : 
            (product.imageUrl ? [product.imageUrl] : []))),
    farmerId: product.farmerId || product.farmer?.id || product.sellerId,
    farmer: product.farmer ? {
      id: product.farmer.id,
      farmName: product.farmer.farmName || product.farmer.name || product.sellerName || 'Unknown Farm',
      location: product.farmer.location || product.location || 'Unknown Location',
      averageRating: product.farmer.averageRating || product.farmer.rating || 0,
      isVerified: product.farmer.isVerified || product.isVerified || false
    } : null,
    ...product
  };
};

// Helper function to safely format price
const formatPrice = (price: string | number | undefined): number => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const parsed = parseFloat(price.replace(/[^\\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Helper function to get product image with fallback
const getProductImage = (images: string[] | string | undefined): string => {
  const fallbackImage = "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300";
  
  if (Array.isArray(images) && images.length > 0) {
    return images[0] || fallbackImage;
  }
  if (typeof images === 'string' && images.trim()) {
    return images;
  }
  return fallbackImage;
};

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
        
        {!products || products.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-seedling text-6xl text-gray-300 mb-6"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
            <p className="text-gray-500">Check back soon for fresh arrivals from local farmers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((rawProduct) => {
              const product = normalizeProduct(rawProduct);
              const productPrice = formatPrice(product.price);
              const productImage = getProductImage(product.images);
              
              return (
              <Card 
                key={product.id} 
                className="overflow-hidden hover:shadow-md transition-shadow"
                data-testid={`card-product-${product.id}`}
              >
                <img
                  src={productImage}
                  alt={product.name || 'Product image'}
                  className="w-full h-48 object-cover"
                  data-testid={`img-product-${product.id}`}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300";
                  }}
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
                    {product.name || 'Unnamed Product'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2" data-testid={`text-farm-name-${product.id}`}>
                    {product.farmer?.farmName || 'Unknown Farm'}
                  </p>
                  {product.farmer?.location && (
                    <p className="text-xs text-gray-400 mb-2" data-testid={`text-farm-location-${product.id}`}>
                      📍 {product.farmer.location}
                    </p>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-farm-green" data-testid={`text-price-${product.id}`}>
                        KSh {productPrice.toLocaleString()}/{product.unit || 'piece'}
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
                    
                    {/* Price Comparison - only show if we have required data */}
                    {product.name && product.category && (
                      <div className="flex justify-center">
                        <PriceComparison
                          productName={product.name}
                          category={product.category}
                          currentPrice={productPrice}
                          farmerId={product.farmerId || ''}
                        />
                      </div>
                    )}

                    {/* Bulk Pricing - only show if we have required data */}
                    {product.id && productPrice > 0 && (
                      <BulkPricing
                        productId={product.id}
                        basePrice={productPrice}
                        unit={product.unit || 'piece'}
                        className="mt-2"
                      />
                    )}
                    
                    {/* Subscription Orders - only show if we have required data */}
                    {product.id && product.name && productPrice > 0 && (
                      <SubscriptionOrders
                        productId={product.id}
                        productName={product.name}
                        currentPrice={productPrice}
                        farmerId={product.farmerId || ''}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
