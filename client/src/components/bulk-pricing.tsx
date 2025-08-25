import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface BulkDiscount {
  id: string;
  minQuantity: number;
  discountPercent: string;
  maxDiscount: string;
}

interface BulkPricingProps {
  productId: string;
  basePrice: number;
  unit: string;
  className?: string;
}

export function BulkPricing({ productId, basePrice, unit, className = "" }: BulkPricingProps) {
  const { data: discountsData, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}/bulk-discounts`],
    retry: false,
  });

  const discounts: BulkDiscount[] = (discountsData as any)?.discounts || [];

  // Don't show component if no bulk discounts available
  if (isLoading || !discounts || discounts.length === 0) {
    return null;
  }

  const calculateDiscountedPrice = (quantity: number, discountPercent: string, maxDiscount: string) => {
    const discount = parseFloat(discountPercent);
    const max = parseFloat(maxDiscount);
    const totalPrice = basePrice * quantity;
    const discountAmount = Math.min((totalPrice * discount) / 100, max || Infinity);
    return totalPrice - discountAmount;
  };

  const calculateSavings = (quantity: number, discountPercent: string, maxDiscount: string) => {
    const originalTotal = basePrice * quantity;
    const discountedTotal = calculateDiscountedPrice(quantity, discountPercent, maxDiscount);
    return originalTotal - discountedTotal;
  };

  return (
    <Card className={`border-green-200 bg-green-50 ${className}`} data-testid="bulk-pricing-card">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-green-600 text-white text-xs">
            Bulk Savings Available
          </Badge>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs text-green-700 font-medium mb-2">
            Save more when you buy in bulk:
          </p>
          
          {discounts.map((discount, index) => {
            const quantity = discount.minQuantity;
            const discountedPrice = calculateDiscountedPrice(quantity, discount.discountPercent, discount.maxDiscount);
            const savings = calculateSavings(quantity, discount.discountPercent, discount.maxDiscount);
            const pricePerUnit = discountedPrice / quantity;
            
            return (
              <div 
                key={discount.id} 
                className="flex items-center justify-between text-xs bg-white p-2 rounded border"
                data-testid={`bulk-tier-${index}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">
                    {quantity}+ {unit}s
                  </span>
                  <span className="text-green-600 font-semibold">
                    KSh {pricePerUnit.toFixed(2)}/{unit}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-medium">
                    Save KSh {savings.toFixed(2)}
                  </div>
                  <div className="text-gray-500">
                    ({discount.discountPercent}% off)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <p className="text-xs text-gray-500 mt-2 italic">
          * Bulk pricing applied automatically at checkout
        </p>
      </CardContent>
    </Card>
  );
}