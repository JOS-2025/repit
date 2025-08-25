import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, CreditCard, Truck, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Footer from "@/components/footer";
import { useLocation } from "wouter";

const guestCheckoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z.string().email("Valid email required").optional(),
  deliveryAddress: z.string().min(10, "Complete delivery address required"),
  paymentMethod: z.enum(["mpesa", "card", "cash_on_delivery"]),
  specialInstructions: z.string().optional(),
});

type GuestCheckoutForm = z.infer<typeof guestCheckoutSchema>;

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: string;
    unit: string;
    farmer: {
      farmName: string;
      location: string;
    };
  };
  quantity: number;
}

export default function GuestCheckout() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Mock cart data - in real app, this would come from state management
  const [cartItems] = useState<CartItem[]>([
    {
      id: "1",
      product: {
        id: "p1",
        name: "Organic Tomatoes",
        price: "12.50",
        unit: "kg",
        farmer: { farmName: "Green Valley Farm", location: "Nakuru" }
      },
      quantity: 2
    },
    {
      id: "2", 
      product: {
        id: "p2",
        name: "Fresh Spinach",
        price: "8.00",
        unit: "bunch",
        farmer: { farmName: "Sunny Acres", location: "Kiambu" }
      },
      quantity: 3
    }
  ]);

  const form = useForm<GuestCheckoutForm>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      deliveryAddress: "",
      paymentMethod: "mpesa",
      specialInstructions: "",
    },
  });

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
  };

  const deliveryFee = 5.00;
  const subtotal = calculateTotal();
  const total = subtotal + deliveryFee;

  const onSubmit = async (data: GuestCheckoutForm) => {
    setIsSubmitting(true);
    try {
      // Create orders for each farmer (group by farmer)
      const farmerOrders = cartItems.reduce((acc, item) => {
        const farmerId = item.product.farmer.farmName; // In real app, use farmer ID
        if (!acc[farmerId]) {
          acc[farmerId] = [];
        }
        acc[farmerId].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);

      const orderPromises = Object.entries(farmerOrders).map(([farmerId, items]) => {
        const orderTotal = items.reduce((sum, item) => 
          sum + (parseFloat(item.product.price) * item.quantity), 0
        );

        return apiRequest("POST", "/api/simple-orders", {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          farmerId,
          items: items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: parseFloat(item.product.price),
            totalPrice: parseFloat(item.product.price) * item.quantity,
          })),
          totalAmount: orderTotal,
          deliveryAddress: data.deliveryAddress,
          paymentMethod: data.paymentMethod,
          specialInstructions: data.specialInstructions,
        });
      });

      const orders = await Promise.all(orderPromises);
      
      toast({
        title: "Order Placed Successfully!",
        description: `Your order has been confirmed. You'll receive updates via WhatsApp at ${data.customerPhone}`,
      });

      // Redirect to order tracking
      setLocation(`/order-tracking?phone=${encodeURIComponent(data.customerPhone)}`);
      
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" data-testid="checkout-title">
            Complete Your Order
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            No account needed - checkout as a guest and we'll keep you updated via WhatsApp
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+254712345678" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Include house number, street, area, and landmarks"
                            {...field} 
                            data-testid="input-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method *</FormLabel>
                        <FormControl>
                          <select 
                            {...field} 
                            className="w-full p-2 border rounded-md"
                            data-testid="select-payment"
                          >
                            <option value="mpesa">M-Pesa</option>
                            <option value="card">Credit/Debit Card</option>
                            <option value="cash_on_delivery">Cash on Delivery</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special delivery instructions..."
                            {...field} 
                            data-testid="input-instructions"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                    data-testid="button-place-order"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Placing Order..." : `Place Order - $${total.toFixed(2)}`}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

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
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.product.farmer.farmName} • {item.product.farmer.location}
                      </p>
                      <p className="text-sm">
                        ${item.product.price} per {item.product.unit} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span data-testid="total-amount">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">📱</Badge>
                    <span className="text-sm">WhatsApp order updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">🚚</Badge>
                    <span className="text-sm">Free delivery on orders over $25</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">⏰</Badge>
                    <span className="text-sm">Same-day delivery available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">🌱</Badge>
                    <span className="text-sm">Fresh, locally sourced produce</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}