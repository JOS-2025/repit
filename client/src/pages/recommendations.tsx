import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ChefHat, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Users, 
  Star,
  ShoppingCart,
  Lightbulb
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  cookingTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  instructions: string[];
}

interface ProductRecommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  reason: string;
  confidence: number;
}

interface TrendingProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  reason: string;
  confidence: number;
}

export default function Recommendations() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("recipes");

  const { data: recipeData, isLoading: recipesLoading } = useQuery({
    queryKey: ["/api/ai/recipe-recommendations"],
    enabled: isAuthenticated,
  });

  const { data: productData, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/ai/product-recommendations"],
    enabled: isAuthenticated,
  });

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/ai/trending-products"],
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 dark:text-green-400";
    if (confidence >= 0.6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (!isAuthenticated && activeTab !== "trending") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-4">AI-Powered Recommendations</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to get personalized recipe and product recommendations
          </p>
          <Button asChild>
            <Link href="/api/login">Log In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="recommendations-page">
      <div className="text-center mb-8">
        <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-2">AI-Powered Recommendations</h1>
        <p className="text-muted-foreground">
          Discover personalized recipes and trending farm products with AI
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recipes" data-testid="tab-recipes">
            <ChefHat className="h-4 w-4 mr-2" />
            Recipes
          </TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">
            <Lightbulb className="h-4 w-4 mr-2" />
            For You
          </TabsTrigger>
          <TabsTrigger value="trending" data-testid="tab-trending">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Recipe Suggestions</h2>
            <p className="text-muted-foreground">
              Based on your recent farm purchases
            </p>
          </div>

          {recipesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(recipeData as any)?.recipes?.map((recipe: Recipe, index: number) => (
                <Card key={index} className="h-full" data-testid={`recipe-card-${index}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{recipe.name}</span>
                      <Badge className={getDifficultyColor(recipe.difficulty)}>
                        {recipe.difficulty}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{recipe.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {recipe.cookingTime} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {recipe.servings} servings
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Ingredients:</h4>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        {recipe.ingredients.slice(0, 3).map((ingredient, i) => (
                          <li key={i}>{ingredient}</li>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <li className="text-muted-foreground">
                            +{recipe.ingredients.length - 3} more...
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Instructions:</h4>
                      <ol className="text-sm space-y-1 list-decimal list-inside">
                        {recipe.instructions.slice(0, 2).map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                        {recipe.instructions.length > 2 && (
                          <li className="text-muted-foreground">
                            +{recipe.instructions.length - 2} more steps...
                          </li>
                        )}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Recommended Products</h2>
            <p className="text-muted-foreground">
              Products you might like based on your purchase history
            </p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(productData as any)?.recommendations?.map((product: ProductRecommendation) => (
                <Card key={product.id} className="h-full hover:shadow-md transition-shadow" data-testid={`product-recommendation-${product.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{product.name}</span>
                      <Badge variant="secondary">{product.category}</Badge>
                    </CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ${product.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        per {product.unit}
                      </span>
                    </div>
                    
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">Why this product?</span>
                        <span className={`text-xs font-medium ${getConfidenceColor(product.confidence)}`}>
                          {Math.round(product.confidence * 100)}% match
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.reason}</p>
                    </div>

                    <Button className="w-full" asChild data-testid={`add-to-cart-${product.id}`}>
                      <Link href={`/products/${product.id}`}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        View Product
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Trending Products</h2>
            <p className="text-muted-foreground">
              Popular and seasonal farm products right now
            </p>
            {(trendingData as any)?.season && (
              <Badge variant="outline" className="mt-2">
                {(trendingData as any).season} season
              </Badge>
            )}
          </div>

          {trendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(trendingData as any)?.trending?.map((product: TrendingProduct) => (
                <Card key={product.id} className="h-full hover:shadow-md transition-shadow" data-testid={`trending-product-${product.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{product.name}</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <Badge variant="secondary">{product.category}</Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ${product.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        per {product.unit}
                      </span>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-sm text-green-800 dark:text-green-200">Trending Now</span>
                        <span className={`text-xs font-medium ${getConfidenceColor(product.confidence)}`}>
                          {Math.round(product.confidence * 100)}% trending
                        </span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">{product.reason}</p>
                    </div>

                    <Button className="w-full" asChild data-testid={`view-trending-${product.id}`}>
                      <Link href={`/products/${product.id}`}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        View Product
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Footer />
    </div>
  );
}