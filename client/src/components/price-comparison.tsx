import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, BarChart3, Users, DollarSign, Star } from "lucide-react";

interface PriceComparisonProps {
  productName: string;
  category: string;
  currentPrice: number;
  farmerId: string;
}

interface PriceData {
  farmerId: string;
  farmerName: string;
  farmLocation: string;
  price: number;
  rating: number;
  inStock: boolean;
  verified: boolean;
  distance?: number;
}

interface ComparisonStats {
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  farmersCount: number;
}

export default function PriceComparison({ productName, category, currentPrice, farmerId }: PriceComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch price comparison data
  const { data: priceData = [], isLoading } = useQuery<PriceData[]>({
    queryKey: ['/api/price-comparison', productName, category],
    enabled: isOpen, // Only fetch when dialog is opened
    retry: false,
  });

  const { data: comparisonStats } = useQuery<ComparisonStats>({
    queryKey: ['/api/price-comparison/stats', productName, category],
    enabled: isOpen,
    retry: false,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const getPriceVariance = () => {
    if (!comparisonStats) return null;
    
    const variance = ((currentPrice - comparisonStats.averagePrice) / comparisonStats.averagePrice) * 100;
    return {
      percentage: Math.abs(variance).toFixed(1),
      isHigher: variance > 0,
      isSignificant: Math.abs(variance) > 10
    };
  };

  const variance = getPriceVariance();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
          data-testid="price-comparison-button"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Compare Prices
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Price Comparison for {productName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Price Statistics */}
            {comparisonStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(comparisonStats?.averagePrice || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Average Price</div>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(comparisonStats?.lowestPrice || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Lowest Price</div>
                  </CardContent>
                </Card>
                
                <Card className="border-orange-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(comparisonStats?.highestPrice || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Highest Price</div>
                  </CardContent>
                </Card>
                
                <Card className="border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
                      <Users className="w-5 h-5" />
                      {comparisonStats?.farmersCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Farmers Offering</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Current Product Price Analysis */}
            {variance && (
              <Card className={`border-2 ${variance.isHigher ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Current Farmer's Price</h4>
                      <p className="text-2xl font-bold">{formatCurrency(currentPrice)}</p>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${variance.isHigher ? 'text-red-600' : 'text-green-600'}`}>
                        {variance.isHigher ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        <span className="font-semibold">{variance.percentage}%</span>
                        <span className="text-sm">
                          {variance.isHigher ? 'above' : 'below'} average
                        </span>
                      </div>
                      {variance.isSignificant && (
                        <Badge variant={variance.isHigher ? "destructive" : "default"} className="mt-1">
                          {variance.isHigher ? 'Premium Pricing' : 'Great Value'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price Comparison List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">All Available Options</h4>
              {priceData.length === 0 ? (
                <Card className="p-8 text-center">
                  <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">No other farmers currently offering this product</p>
                </Card>
              ) : (
                priceData.map((item, index: number) => (
                  <Card 
                    key={item.farmerId} 
                    className={`${item.farmerId === farmerId ? 'border-blue-500 bg-blue-50' : 'hover:shadow-md'} transition-shadow`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-gray-900">{item.farmerName}</h5>
                            {item.verified && (
                              <Badge className="bg-green-600 text-white text-xs">Verified</Badge>
                            )}
                            {item.farmerId === farmerId && (
                              <Badge className="bg-blue-600 text-white text-xs">Current Selection</Badge>
                            )}
                            {index === 0 && (
                              <Badge className="bg-yellow-600 text-white text-xs">Best Price</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>📍 {item.farmLocation}</span>
                            {item.distance && <span>🚛 {item.distance}km away</span>}
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{item.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(item.price)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {item.inStock ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">In Stock</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 text-xs">Out of Stock</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Tips Section */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm">💡 Price Comparison Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Higher prices may indicate premium quality, organic farming, or closer proximity</p>
                <p>• Consider farmer ratings and verification status when comparing prices</p>
                <p>• Seasonal variations can affect pricing - check harvest dates for freshest produce</p>
                <p>• Factor in delivery distance for the most cost-effective choice</p>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}