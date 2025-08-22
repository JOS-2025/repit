import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BulkPricing } from "@/components/bulk-pricing";
import { ArrowLeft, ShoppingCart, Star } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetail() {
  const { productId } = useParams();

  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/products">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <img
              src={product.imageUrl || "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
              alt={product.name}
              className="w-full h-96 object-cover"
              data-testid="img-product-detail"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.farmer?.isVerified && (
                  <Badge className="bg-green-600 text-white">
                    Verified Farmer
                  </Badge>
                )}
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Fresh
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-product-name">
                {product.name}
              </h1>
              
              <p className="text-lg text-gray-600 mb-4" data-testid="text-farm-name">
                From {product.farmer?.farmName}
              </p>

              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-3xl font-bold text-green-600" data-testid="text-price">
                  KSh {parseFloat(product.price || 0).toLocaleString()}
                </span>
                <span className="text-gray-500">per {product.unit}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>Available: {product.quantity} {product.unit}s</span>
                {product.farmer?.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{product.farmer.rating}</span>
                  </div>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed mb-6" data-testid="text-description">
                {product.description}
              </p>

              {/* Bulk Pricing Display */}
              <BulkPricing
                productId={product.id}
                basePrice={parseFloat(product.price || 0)}
                unit={product.unit}
                className="mb-6"
              />

              <Button 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700"
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Farm Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Farm Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Farm: </span>
                    <span className="text-gray-600">{product.farmer?.farmName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Farmer: </span>
                    <span className="text-gray-600">
                      {product.farmer?.user?.firstName} {product.farmer?.user?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location: </span>
                    <span className="text-gray-600">{product.farmer?.location || "Kenya"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Category: </span>
                    <span className="text-gray-600">{product.category}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}