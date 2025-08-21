import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import CategoryFilter from "@/components/category-filter";
import ProductGrid from "@/components/product-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Leaf, Heart, MapPin, User, Star } from "lucide-react";
import { VoiceSearchButton } from "@/components/voice-search-button";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "product" | "farmer" | "location">("all");
  const [sortBy, setSortBy] = useState<"name" | "price" | "rating" | "distance">("name");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products", selectedCategory ? { category: selectedCategory } : {}],
    retry: false,
  });

  // Smart search functionality
  const filteredProducts = useMemo(() => {
    let filtered = (products as any[]).filter((product: any) => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      
      switch (searchType) {
        case "product":
          return product.name.toLowerCase().includes(query) ||
                 product.description?.toLowerCase().includes(query) ||
                 product.category?.toLowerCase().includes(query);
        
        case "farmer":
          return product.farmer?.farmName?.toLowerCase().includes(query) ||
                 product.farmer?.firstName?.toLowerCase().includes(query) ||
                 product.farmer?.lastName?.toLowerCase().includes(query);
        
        case "location":
          return product.farmer?.location?.toLowerCase().includes(query) ||
                 product.farmer?.county?.toLowerCase().includes(query) ||
                 product.farmer?.town?.toLowerCase().includes(query);
        
        default: // "all"
          return product.name.toLowerCase().includes(query) ||
                 product.description?.toLowerCase().includes(query) ||
                 product.farmer?.farmName?.toLowerCase().includes(query) ||
                 product.farmer?.location?.toLowerCase().includes(query) ||
                 product.category?.toLowerCase().includes(query);
      }
    });

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return parseFloat(a.price || 0) - parseFloat(b.price || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "distance":
          return (a.distance || 0) - (b.distance || 0);
        default: // "name"
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchQuery, searchType, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Fresh Farm Produce
            </h1>
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover fresh, quality produce directly from verified local farmers. 
            Support sustainable agriculture and enjoy farm-to-table freshness.
          </p>
          
          {/* Smart Search and Filter Section */}
          <Card className="max-w-4xl mx-auto mb-8 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Input with Type Selection */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder={
                          searchType === "product" ? "Search products..." :
                          searchType === "farmer" ? "Search farmers..." :
                          searchType === "location" ? "Search locations..." :
                          "Search products, farmers, locations..."
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-green-200 focus:border-green-500"
                        data-testid="input-search-products"
                      />
                    </div>
                    <VoiceSearchButton 
                      onVoiceResult={(transcript) => setSearchQuery(transcript)}
                      size="default"
                      className="shrink-0"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                      <SelectTrigger className="w-40 border-green-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            All
                          </div>
                        </SelectItem>
                        <SelectItem value="product">
                          <div className="flex items-center gap-2">
                            <Leaf className="w-4 h-4" />
                            Products
                          </div>
                        </SelectItem>
                        <SelectItem value="farmer">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Farmers
                          </div>
                        </SelectItem>
                        <SelectItem value="location">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Locations
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-40 border-green-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name A-Z</SelectItem>
                        <SelectItem value="price">Price Low-High</SelectItem>
                        <SelectItem value="rating">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Rating
                          </div>
                        </SelectItem>
                        <SelectItem value="distance">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Distance
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Search Results Info */}
                {searchQuery && (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {filteredProducts.length} results for "{searchQuery}" 
                      {searchType !== "all" && ` in ${searchType}s`}
                    </Badge>
                    {selectedCategory && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Category: {selectedCategory}
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Sorted by: {sortBy}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Farm Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
            <Card className="text-center border-green-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {(products as any[]).length}+
                </div>
                <div className="text-sm text-gray-600">Fresh Products</div>
              </CardContent>
            </Card>
            <Card className="text-center border-blue-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">50+</div>
                <div className="text-sm text-gray-600">Local Farmers</div>
              </CardContent>
            </Card>
            <Card className="text-center border-orange-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1">24hr</div>
                <div className="text-sm text-gray-600">Fresh Guarantee</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        {/* Products Section */}
        <div className="mb-8">
          {selectedCategory && (
            <div className="mb-6">
              <Badge className="bg-green-600 text-white px-4 py-2 text-sm">
                <Leaf className="w-4 h-4 mr-2" />
                {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products
              </Badge>
            </div>
          )}
        </div>
        
        <ProductGrid 
          products={filteredProducts}
          isLoading={isLoading}
          showLoginPrompt={true}
        />

        {/* Call to Action */}
        {!isLoading && filteredProducts.length > 0 && (
          <Card className="mt-12 bg-gradient-to-r from-green-500 to-blue-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Join the Farm-to-Table Revolution
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Support local farmers, enjoy the freshest produce, and help build a sustainable food system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-green-600 hover:bg-gray-100"
                  onClick={() => window.location.href = '/farmer-dashboard'}
                >
                  Become a Farmer Partner
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-green-600"
                  onClick={() => window.location.href = '/community'}
                >
                  Join Our Community
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
