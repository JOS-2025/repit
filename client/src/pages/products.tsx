import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import CategoryFilter from "@/components/category-filter";
import ProductGrid from "@/components/product-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, Leaf, Heart } from "lucide-react";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products", selectedCategory ? { category: selectedCategory } : {}],
    retry: false,
  });

  const filteredProducts = (products as any[]).filter((product: any) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          
          {/* Search and Filter Section */}
          <Card className="max-w-2xl mx-auto mb-8 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search for fruits, vegetables, herbs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-green-200 focus:border-green-500"
                    data-testid="input-search-products"
                  />
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>
              
              {/* Search Results Info */}
              {searchQuery && (
                <div className="mt-4 text-sm text-gray-600">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {filteredProducts.length} products found for "{searchQuery}"
                  </Badge>
                </div>
              )}
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
