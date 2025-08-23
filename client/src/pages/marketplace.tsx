import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, Filter, Heart, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  unit: string;
  availableQuantity: number;
  images: string[];
  farmer: {
    farmName: string;
    location: string;
    averageRating: string;
  };
}

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products", { search: searchTerm, category: selectedCategory, sort: sortBy }],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const addToCart = async (productId: string) => {
    try {
      await apiRequest("POST", "/api/cart", { productId, quantity: 1 });
      toast({
        title: "Added to cart",
        description: "Product added to your cart successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      await apiRequest("POST", "/api/wishlist", { productId });
      toast({
        title: "Added to wishlist",
        description: "Product saved to your wishlist!",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to add to wishlist",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4" data-testid="marketplace-title">
            Fresh from Farm to Your Table
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Discover locally grown, organic produce directly from verified farmers
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search fresh produce, farmers, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
              data-testid="search-input"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              data-testid="filter-all"
            >
              All Products
            </Button>
            {categories.map((category: string) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                data-testid={`filter-${category}`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md"
            data-testid="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Best Rated</option>
            <option value="distance">Nearest First</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: Product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow" data-testid={`product-card-${product.id}`}>
              <CardHeader className="p-0">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      data-testid={`product-image-${product.id}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-300 text-4xl">🥬</span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => addToWishlist(product.id)}
                    data-testid={`wishlist-${product.id}`}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Badge className="absolute bottom-2 left-2 bg-green-600">
                    {product.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2" data-testid={`product-name-${product.id}`}>
                  {product.name}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600" data-testid={`product-price-${product.id}`}>
                      ${product.price}
                    </span>
                    <span className="text-sm text-gray-500">per {product.unit}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{product.farmer.farmName}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{product.farmer.averageRating}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    📍 {product.farmer.location}
                  </div>
                  
                  <div className="text-sm">
                    <span className={product.availableQuantity > 10 ? "text-green-600" : "text-orange-600"}>
                      {product.availableQuantity > 10 ? "In Stock" : `Only ${product.availableQuantity} left`}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0 space-y-2">
                <Button
                  className="w-full"
                  onClick={() => addToCart(product.id)}
                  disabled={product.availableQuantity === 0}
                  data-testid={`add-to-cart-${product.id}`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Link href={`/product/${product.id}`} className="block w-full">
                  <Button variant="outline" className="w-full" data-testid={`view-product-${product.id}`}>
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🥕</div>
            <h3 className="text-2xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}