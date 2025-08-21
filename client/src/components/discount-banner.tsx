import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Tag, 
  Percent, 
  Gift, 
  ShoppingCart, 
  Clock,
  Star,
  TrendingUp 
} from 'lucide-react';

interface Discount {
  id: string;
  discountType: 'bulk' | 'loyalty' | 'seasonal';
  minQuantity?: number;
  discountPercent: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  product?: {
    id: string;
    name: string;
    price: number;
  };
  farmer?: {
    farmName: string;
  };
}

interface LoyaltyStats {
  totalOrders: number;
  totalSpent: number;
  loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  nextLevelSpending: number;
  discountPercentage: number;
}

interface DiscountBannerProps {
  productId?: string;
  farmerId?: string;
  quantity?: number;
  className?: string;
}

export default function DiscountBanner({ 
  productId, 
  farmerId, 
  quantity = 1, 
  className = "" 
}: DiscountBannerProps) {
  const { isAuthenticated, user } = useAuth();
  const [availableDiscounts, setAvailableDiscounts] = useState<Discount[]>([]);

  // Get available discounts
  const { data: discounts = [] } = useQuery({
    queryKey: ['/api/discounts', productId, farmerId],
    enabled: !!(productId || farmerId),
    retry: false,
  });

  // Get user loyalty stats
  const { data: loyaltyStats } = useQuery({
    queryKey: ['/api/loyalty/stats'],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  const discountsArray = Array.isArray(discounts) ? discounts as Discount[] : [];
  const loyalty = loyaltyStats as LoyaltyStats;

  // Calculate applicable discounts
  useEffect(() => {
    const applicable = discountsArray.filter(discount => {
      // Check if discount is active
      if (!discount.isActive) return false;
      
      // Check date range
      const now = new Date();
      const start = new Date(discount.startDate);
      const end = new Date(discount.endDate);
      if (now < start || now > end) return false;
      
      // Check quantity for bulk discounts
      if (discount.discountType === 'bulk' && discount.minQuantity) {
        return quantity >= discount.minQuantity;
      }
      
      return true;
    });
    
    setAvailableDiscounts(applicable);
  }, [discountsArray, quantity]);

  if (!isAuthenticated) {
    return null;
  }

  const getBulkDiscountProgress = (minQuantity: number) => {
    return Math.min((quantity / minQuantity) * 100, 100);
  };

  const getLoyaltyLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoyaltyIcon = (level: string) => {
    switch (level) {
      case 'bronze': return <Star className="w-4 h-4 text-orange-600" />;
      case 'silver': return <Star className="w-4 h-4 text-gray-600" />;
      case 'gold': return <Star className="w-4 h-4 text-yellow-600" />;
      case 'platinum': return <Star className="w-4 h-4 text-purple-600" />;
      default: return <Star className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffInHours = Math.max(0, Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60)));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours left`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} days left`;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      
      {/* Loyalty Status */}
      {loyalty && (
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getLoyaltyIcon(loyalty.loyaltyLevel)}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-green-800">
                      {loyalty.loyaltyLevel.charAt(0).toUpperCase() + loyalty.loyaltyLevel.slice(1)} Member
                    </h4>
                    <Badge className={getLoyaltyLevelColor(loyalty.loyaltyLevel)}>
                      {loyalty.discountPercentage}% off
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700">
                    {loyalty.totalOrders} orders • KSh {loyalty.totalSpent.toLocaleString()} spent
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-green-700">
                  KSh {loyalty.nextLevelSpending.toLocaleString()} to next level
                </p>
                <Progress 
                  value={Math.min((loyalty.totalSpent / loyalty.nextLevelSpending) * 100, 100)} 
                  className="w-20 h-2 mt-1" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Discounts */}
      {availableDiscounts.map((discount) => (
        <Card key={discount.id} className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  {discount.discountType === 'bulk' ? (
                    <ShoppingCart className="w-4 h-4 text-orange-600" />
                  ) : discount.discountType === 'loyalty' ? (
                    <Star className="w-4 h-4 text-orange-600" />
                  ) : (
                    <Gift className="w-4 h-4 text-orange-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-orange-800">
                      {discount.discountType === 'bulk' ? 'Bulk Discount' :
                       discount.discountType === 'loyalty' ? 'Loyalty Reward' : 'Special Offer'}
                    </h4>
                    <Badge variant="secondary" className="text-orange-700 bg-orange-100">
                      <Percent className="w-3 h-3 mr-1" />
                      {discount.discountPercent}% OFF
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-orange-700 mb-2">
                    {discount.discountType === 'bulk' && discount.minQuantity ? (
                      `Buy ${discount.minQuantity}+ items and save up to KSh ${discount.maxDiscount.toLocaleString()}`
                    ) : discount.discountType === 'loyalty' ? (
                      `Loyalty discount for returning customers`
                    ) : (
                      `Limited time offer - save up to KSh ${discount.maxDiscount.toLocaleString()}`
                    )}
                  </p>
                  
                  {discount.product && (
                    <p className="text-xs text-orange-600">
                      On {discount.product.name} by {discount.farmer?.farmName}
                    </p>
                  )}
                  
                  {/* Bulk discount progress */}
                  {discount.discountType === 'bulk' && discount.minQuantity && quantity < discount.minQuantity && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-orange-600 mb-1">
                        <span>Add {discount.minQuantity - quantity} more to qualify</span>
                        <span>{quantity}/{discount.minQuantity}</span>
                      </div>
                      <Progress 
                        value={getBulkDiscountProgress(discount.minQuantity)} 
                        className="h-2" 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-orange-600 mb-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeLeft(discount.endDate)}
                </div>
                
                {discount.discountType === 'bulk' && discount.minQuantity && quantity >= discount.minQuantity && (
                  <Badge className="bg-green-100 text-green-800">
                    ✓ Qualified
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Bulk Discount Suggestions */}
      {discountsArray.some(d => d.discountType === 'bulk' && d.minQuantity && quantity < d.minQuantity) && (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-800 mb-1">Smart Savings Tip</h4>
                <p className="text-sm text-blue-700">
                  Add more items to unlock better discounts! Your savings increase with quantity.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Browse More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No discounts message */}
      {availableDiscounts.length === 0 && discountsArray.length === 0 && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-4 text-center">
            <Tag className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No active discounts available</p>
            <p className="text-xs text-gray-400 mt-1">
              Check back later for special offers and bulk discounts!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}