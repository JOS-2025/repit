import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Apple, 
  Carrot, 
  Wheat, 
  Milk, 
  Leaf, 
  Package,
  ShoppingCart,
  Star,
  MapPin,
  User
} from "lucide-react";

const categoryIcons = {
  fruits: Apple,
  vegetables: Carrot,
  grains: Wheat,
  dairy: Milk,
  herbs: Leaf,
  others: Package,
};

const categoryColors = {
  fruits: "bg-red-50 border-red-200 text-red-800",
  vegetables: "bg-green-50 border-green-200 text-green-800", 
  grains: "bg-yellow-50 border-yellow-200 text-yellow-800",
  dairy: "bg-blue-50 border-blue-200 text-blue-800",
  herbs: "bg-purple-50 border-purple-200 text-purple-800",
  others: "bg-gray-50 border-gray-200 text-gray-800",
};

const categoryDescriptions = {
  fruits: "Fresh, juicy seasonal fruits packed with vitamins and natural sweetness",
  vegetables: "Crisp, nutritious vegetables grown with sustainable farming practices",
  grains: "Wholesome grains and cereals for your daily nutritional needs",
  dairy: "Fresh dairy products from local farms with highest quality standards",
  herbs: "Aromatic herbs and spices to enhance your culinary experiences",
  others: "Specialty farm products and unique agricultural offerings",
};

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
    retry: false,
  });

  // Group products by category
  const categorizedProducts = (products as any[]).reduce((acc: any, product: any) => {
    const category = product.category || 'others';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  const categoryKeys = Object.keys(categorizedProducts);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <i className="fas fa-seedling text-farm-green text-4xl mb-4 animate-pulse"></i>
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    const categoryProducts = categorizedProducts[selectedCategory] || [];
    const IconComponent = categoryIcons[selectedCategory as keyof typeof categoryIcons] || Package;

    return (
      <div className="min-h-screen bg-warm-bg">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Category Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedCategory("")}
              className="mb-4 text-farm-green hover:text-farm-green-dark"
              data-testid="button-back-categories"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Categories
            </Button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-full ${categoryColors[selectedCategory as keyof typeof categoryColors]?.replace('text-', 'bg-').replace('-800', '-100')}`}>
                <IconComponent className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 capitalize" data-testid="text-category-name">
                  {selectedCategory}
                </h1>
                <p className="text-gray-600">
                  {categoryDescriptions[selectedCategory as keyof typeof categoryDescriptions]}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" data-testid="text-product-count">
                {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'}
              </Badge>
            </div>
          </div>

          {/* Products Grid */}
          {categoryProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No products in this category</h3>
              <p className="text-gray-600">Check back soon for new products!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map((product: any) => (
                <Card 
                  key={product.id} 
                  className="group hover:shadow-lg transition-shadow duration-200 border-gray-200"
                  data-testid={`card-product-${product.id}`}
                >
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <IconComponent className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Quick Add Button */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          className="bg-white/90 hover:bg-white text-gray-700"
                          data-testid={`button-quick-add-${product.id}`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4">
                      <div className="mb-2">
                        <h3 className="font-medium text-gray-900 group-hover:text-farm-green transition-colors" data-testid={`text-product-name-${product.id}`}>
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-bold text-farm-green" data-testid={`text-price-${product.id}`}>
                          KSh {parseFloat(product.price || 0).toLocaleString()}
                          <span className="text-sm text-gray-500 font-normal">/{product.unit}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {product.availableQuantity} available
                        </Badge>
                      </div>

                      {/* Farmer Info */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <User className="w-3 h-3" />
                        <span>{product.farmer?.farmName}</span>
                        <MapPin className="w-3 h-3 ml-2" />
                        <span>{product.farmer?.location}</span>
                      </div>

                      {/* Rating */}
                      {product.rating && (
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({product.reviewCount} reviews)</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-farm-green hover:bg-farm-green-dark"
                          size="sm"
                          data-testid={`button-add-cart-${product.id}`}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add to Cart
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-view-details-${product.id}`}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-page-title">
            Product Categories
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse our fresh farm products by category. From seasonal fruits to organic vegetables, 
            find exactly what you need for your table.
          </p>
        </div>

        {/* Categories Grid */}
        {categoryKeys.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No products available yet</h3>
            <p className="text-gray-600">Check back soon for fresh farm products!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryKeys.map((category) => {
              const products = categorizedProducts[category];
              const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Package;
              
              return (
                <Card 
                  key={category}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-farm-green"
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`card-category-${category}`}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${categoryColors[category as keyof typeof categoryColors]?.replace('text-', 'bg-').replace('-800', '-100')} group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <CardTitle className="capitalize text-xl" data-testid={`text-category-${category}`}>
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-4 text-sm">
                      {categoryDescriptions[category as keyof typeof categoryDescriptions]}
                    </p>
                    
                    <div className="space-y-3">
                      <Badge 
                        variant="secondary" 
                        className="text-sm"
                        data-testid={`badge-count-${category}`}
                      >
                        {products.length} {products.length === 1 ? 'product' : 'products'}
                      </Badge>
                      
                      {/* Sample Products */}
                      {products.length > 0 && (
                        <div className="text-xs text-gray-500">
                          <p className="font-medium mb-1">Featured:</p>
                          <p className="truncate">
                            {products.slice(0, 3).map((p: any) => p.name).join(', ')}
                            {products.length > 3 && ` +${products.length - 3} more`}
                          </p>
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-farm-green group-hover:text-white group-hover:border-farm-green transition-colors"
                        data-testid={`button-view-${category}`}
                      >
                        View {category}
                        <i className="fas fa-arrow-right ml-2 text-sm group-hover:translate-x-1 transition-transform"></i>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        {categoryKeys.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <div className="text-2xl font-bold text-farm-green" data-testid="text-total-products">
                {(products as any[]).length}
              </div>
              <div className="text-sm text-gray-600">Total Products</div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-2xl font-bold text-blue-600" data-testid="text-total-categories">
                {categoryKeys.length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-2xl font-bold text-purple-600" data-testid="text-total-farmers">
                {new Set((products as any[]).map(p => p.farmer?.id)).size}
              </div>
              <div className="text-sm text-gray-600">Active Farmers</div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-2xl font-bold text-orange-600" data-testid="text-fresh-today">
                {(products as any[]).filter(p => {
                  const harvestDate = new Date(p.harvestDate);
                  const today = new Date();
                  const diffTime = Math.abs(today.getTime() - harvestDate.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 3;
                }).length}
              </div>
              <div className="text-sm text-gray-600">Fresh This Week</div>
            </Card>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}