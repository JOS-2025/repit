import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { 
  CreditCard, 
  Smartphone, 
  Truck, 
  MapPin, 
  ShoppingCart,
  CheckCircle 
} from 'lucide-react';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    farmer: {
      id: string;
      farmName: string;
    };
  };
  quantity: number;
}

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Please Sign In",
        description: "You need to sign in to checkout",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ['/api/cart'],
    enabled: !!isAuthenticated,
    retry: false,
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to place order');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${data.orderId} has been placed. You will receive confirmation shortly.`,
      });
      
      // Clear cart and redirect
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      setTimeout(() => {
        window.location.href = `/orders/${data.orderId}`;
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!cartItems || (cartItems as any)?.length === 0) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="text-center p-8">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">Add some fresh produce to continue with checkout</p>
            <Button onClick={() => window.location.href = '/'}>
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const totalAmount = (cartItems as any)?.reduce(
    (sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 
    0
  );

  const deliveryFee = totalAmount > 1000 ? 0 : 100; // Free delivery for orders over KSh 1000
  const finalTotal = totalAmount + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a delivery address",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'mpesa' && !phoneNumber.trim()) {
      toast({
        title: "Missing Information", 
        description: "Please provide your M-Pesa phone number",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      await placeOrderMutation.mutateAsync({
        cartItems,
        paymentMethod,
        phoneNumber: paymentMethod === 'mpesa' ? phoneNumber : undefined,
        deliveryAddress,
        notes,
        totalAmount: finalTotal,
        deliveryFee,
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDeliveryAddress(`GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          toast({
            title: "Location Captured",
            description: "Current location has been set as delivery address",
          });
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter address manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(cartItems as any)?.map((item: CartItem) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">
                        by {item.product.farmer.farmName}
                      </p>
                      <p className="text-sm">
                        {item.quantity} {item.product.unit} × KSh {item.product.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-semibold">
                      KSh {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>KSh {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                      {deliveryFee === 0 ? "FREE" : `KSh ${deliveryFee}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">KSh {finalTotal.toLocaleString()}</span>
                  </div>
                </div>
                
                {totalAmount < 1000 && (
                  <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                    💡 Add KSh {(1000 - totalAmount).toLocaleString()} more for free delivery!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="space-y-6">
            
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                  <div className="flex gap-2 mt-1">
                    <Textarea
                      id="deliveryAddress"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your complete delivery address"
                      required
                      data-testid="delivery-address"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      className="px-3"
                      data-testid="get-location"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special delivery instructions..."
                    data-testid="delivery-notes"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={setPaymentMethod}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="mpesa" id="mpesa" />
                    <Label htmlFor="mpesa" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Smartphone className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-medium">M-Pesa</p>
                        <p className="text-sm text-gray-600">Pay with your mobile money</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="cash_on_delivery" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-gray-600">Pay when you receive your order</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                
                {paymentMethod === 'mpesa' && (
                  <div className="mt-4">
                    <Label htmlFor="phoneNumber">M-Pesa Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="254712345678"
                      required
                      data-testid="mpesa-phone"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      You will receive an M-Pesa prompt to complete payment
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || placeOrderMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
              data-testid="place-order"
            >
              {isPlacingOrder || placeOrderMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Order...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Place Order - KSh {finalTotal.toLocaleString()}
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-600 text-center">
              By placing this order, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}