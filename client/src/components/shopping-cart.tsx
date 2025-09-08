import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart as ShoppingCartIcon, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { safeArray, safeNumber, safeString, formatPrice, validateApiResponse } from '@/lib/dataUtils';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    images?: string[];
    farmer: {
      farmName: string;
    };
  };
  quantity: number;
}

interface ShoppingCartProps {
  onCheckout?: () => void;
}

export default function ShoppingCart({ onCheckout }: ShoppingCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rawCartData, isLoading, error } = useQuery({
    queryKey: ['/api/cart'],
    retry: false,
  });

  // Safely extract cart items with validation
  const cartItems = (() => {
    try {
      const validatedResponse = validateApiResponse(rawCartData);
      if (!validatedResponse.success) {
        console.warn('Cart data validation failed:', validatedResponse.error);
        return [];
      }
      return safeArray(validatedResponse.data, []);
    } catch (error) {
      console.error('Error processing cart data:', error);
      return [];
    }
  })();

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      // Validate inputs
      if (!itemId || quantity < 0 || quantity > 999) {
        throw new Error('Invalid item ID or quantity');
      }

      const response = await fetch(`/api/cart/${encodeURIComponent(itemId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: safeNumber(quantity, 1) }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update cart: ${response.status} ${errorData}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!itemId) {
        throw new Error('Item ID is required');
      }

      const response = await fetch(`/api/cart/${encodeURIComponent(itemId)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to remove item: ${response.status} ${errorData}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const cartItemsArray = Array.isArray(cartItems) ? cartItems as CartItem[] : [];
  const totalItems = cartItemsArray.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  const totalAmount = cartItemsArray.reduce(
    (sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 
    0
  );

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  const removeItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handleCheckout = () => {
    setIsOpen(false);
    onCheckout?.();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative"
          data-testid="cart-trigger"
        >
          <ShoppingCartIcon className="w-4 h-4" />
          {totalItems > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5 min-w-[1.2rem] h-5"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="w-5 h-5" />
            Shopping Cart ({totalItems} items)
          </SheetTitle>
          <SheetDescription>
            Review your items before checkout
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : cartItemsArray.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCartIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
              <p className="text-sm text-gray-400">Add some fresh produce to get started!</p>
            </div>
          ) : (
            cartItemsArray.map((item: CartItem) => (
              <Card key={item.id} className="p-4" data-testid={`cart-item-${item.id}`}>
                <div className="flex items-start gap-3">
                  {item.product.images?.[0] && (
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{item.product.name}</h4>
                    <p className="text-xs text-gray-500">by {item.product.farmer.farmName}</p>
                    <p className="text-sm font-medium text-green-600">
                      KSh {item.product.price.toLocaleString()} / {item.product.unit}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                          data-testid={`decrease-${item.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <span className="text-sm font-medium w-8 text-center" data-testid={`quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updateQuantityMutation.isPending}
                          data-testid={`increase-${item.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeItem(item.id)}
                        disabled={removeItemMutation.isPending}
                        data-testid={`remove-${item.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <p className="text-sm font-semibold text-right mt-1">
                      Subtotal: KSh {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {cartItemsArray.length > 0 && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-green-600" data-testid="cart-total">
                KSh {totalAmount.toLocaleString()}
              </span>
            </div>
            
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleCheckout}
              data-testid="checkout-button"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Export the add to cart function for use in product components
export { ShoppingCart as ShoppingCartComponent };

// Hook for adding items to cart from product pages
export function useAddToCart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add to cart');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to Cart!",
        description: "Item has been added to your cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });
}