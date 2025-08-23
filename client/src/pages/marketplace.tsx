import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  ShoppingCart, Search, Filter, Heart, Star, MapPin, Clock, 
  TrendingUp, Sparkles, ChefHat, Eye, X, SlidersHorizontal,
  ArrowUpDown, Zap, Leaf
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [locationFilter, setLocationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { search: searchTerm, category: selectedCategory, sort: sortBy }],
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/categories"],
  });

  const { data: trendingProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products/trending"],
  });

  const { data: aiRecommendations = [] } = useQuery<Product[]>({
    queryKey: ["/api/ai/recommendations", { searchTerm, category: selectedCategory }],
    enabled: searchTerm.length > 2 || selectedCategory !== "all",
  });

  // Enhanced search with AI suggestions
  const searchSuggestionsMutation = useMutation({
    mutationFn: async (query: string): Promise<string[]> => {
      if (query.length < 2) return [];
      const response = await apiRequest("POST", "/api/ai/search-suggestions", { query });
      return response.suggestions || [];
    },
    onSuccess: (suggestions: string[]) => {
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    },
  });

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length > 1) {
        searchSuggestionsMutation.mutate(searchTerm);
      } else {
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      await apiRequest("POST", "/api/cart", { productId, quantity });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Product added successfully!",
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
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
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

  // Enhanced filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrice = parseFloat(product.price) >= priceRange[0] && parseFloat(product.price) <= priceRange[1];
      const matchesLocation = !locationFilter || 
                            product.farmer.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      return matchesSearch && matchesCategory && matchesPrice && matchesLocation;
    });
  }, [products, searchTerm, selectedCategory, priceRange, locationFilter]);

  // Sorting logic
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "price_low":
        return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case "price_high":
        return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case "rating":
        return sorted.sort((a, b) => parseFloat(b.farmer.averageRating) - parseFloat(a.farmer.averageRating));
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

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
          
          {/* Enhanced Search Bar with Suggestions */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <Input
              type="text"
              placeholder="Search fresh produce, farmers, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 pr-4 py-3 text-lg relative z-0"
              data-testid="search-input"
            />
            <Zap className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500 w-4 h-4" />
            
            {/* AI Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                <div className="p-2 border-b">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Sparkles className="w-4 h-4" />
                    AI Suggestions
                  </div>
                </div>
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    onClick={() => {
                      setSearchTerm(suggestion);
                      setShowSuggestions(false);
                    }}
                    data-testid={`suggestion-${index}`}
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Trending & Discovery Section */}
        {trendingProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold">Trending Now</h2>
              <Badge className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                Hot 🔥
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {trendingProducts.slice(0, 4).map((product: Product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer" 
                      onClick={() => setQuickViewProduct(product)}>
                  <CardHeader className="p-3">
                    <div className="relative h-32 rounded-md overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} 
                             className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                          <span className="text-2xl">🌿</span>
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Hot
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                    <p className="text-lg font-bold text-green-600">${product.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <span className="font-semibold">Filters</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="toggle-filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilters ? 'Less' : 'More'}
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                  data-testid="sort-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Best Rated</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  data-testid="view-grid"
                >
                  ⚏
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  data-testid="view-list"
                >
                  ≡
                </Button>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              data-testid="filter-all"
            >
              All Products
            </Button>
            {categories.map((category: string) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                data-testid={`filter-${category}`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t">
              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  💰 Price Range
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={200}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <Input
                  placeholder="Enter city or area..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  data-testid="location-filter"
                />
              </div>

              {/* Quick Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Quick Filters
                </label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-green-100">
                    <Leaf className="w-3 h-3 mr-1" />
                    Organic
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-blue-100">
                    <Clock className="w-3 h-3 mr-1" />
                    Same Day
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-yellow-100">
                    <Star className="w-3 h-3 mr-1" />
                    Top Rated
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        {aiRecommendations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold">Recommended for You</h2>
              <Badge className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                AI Powered
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {aiRecommendations.slice(0, 4).map((product: Product) => (
                <Card key={`ai-${product.id}`} className="hover:shadow-md transition-shadow cursor-pointer border-purple-200"
                      onClick={() => setQuickViewProduct(product)}>
                  <CardHeader className="p-3">
                    <div className="relative h-32 rounded-md overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} 
                             className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                          <span className="text-2xl">🤖</span>
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-purple-500 text-white text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                    <p className="text-lg font-bold text-green-600">${product.price}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{product.farmer.averageRating}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'All Products'}
            <span className="text-gray-500 font-normal ml-2">({sortedProducts.length} items)</span>
          </h2>
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm('')}
              data-testid="clear-search"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {sortedProducts.map((product: Product) => (
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

        {/* Quick View Modal */}
        <Dialog open={!!quickViewProduct} onOpenChange={(open) => !open && setQuickViewProduct(null)}>
          <DialogContent className="max-w-4xl">
            {quickViewProduct && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span>{quickViewProduct.name}</span>
                    <Badge variant="secondary">{quickViewProduct.category}</Badge>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Images */}
                  <div className="space-y-4">
                    <div className="relative h-64 rounded-lg overflow-hidden">
                      {quickViewProduct.images?.[0] ? (
                        <img 
                          src={quickViewProduct.images[0]} 
                          alt={quickViewProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-300 text-6xl">🥬</span>
                        </div>
                      )}
                    </div>
                    {quickViewProduct.images && quickViewProduct.images.length > 1 && (
                      <div className="flex gap-2">
                        {quickViewProduct.images.slice(1, 4).map((image, index) => (
                          <div key={index} className="w-16 h-16 rounded-md overflow-hidden border">
                            <img src={image} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {quickViewProduct.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-3xl font-bold text-green-600">
                            ${quickViewProduct.price}
                          </span>
                          <span className="text-gray-500">per {quickViewProduct.unit}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{quickViewProduct.farmer.farmName}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{quickViewProduct.farmer.averageRating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {quickViewProduct.farmer.location}
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          <span className={quickViewProduct.availableQuantity > 10 ? "text-green-600" : "text-orange-600"}>
                            {quickViewProduct.availableQuantity > 10 
                              ? "✓ In Stock" 
                              : `Only ${quickViewProduct.availableQuantity} left`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => {
                            addToCart(quickViewProduct.id);
                            setQuickViewProduct(null);
                          }}
                          disabled={quickViewProduct.availableQuantity === 0}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => addToWishlist(quickViewProduct.id)}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Link href={`/product/${quickViewProduct.id}`} className="block w-full">
                        <Button variant="outline" className="w-full" onClick={() => setQuickViewProduct(null)}>
                          View Full Details
                        </Button>
                      </Link>
                    </div>

                    {/* Additional Features */}
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <ChefHat className="w-4 h-4 text-gray-500" />
                        <span>Recipe suggestions available</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Leaf className="w-4 h-4 text-green-500" />
                        <span>Locally grown & fresh</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>Same-day delivery available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}