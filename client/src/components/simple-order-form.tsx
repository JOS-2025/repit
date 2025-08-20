import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface OrderFormProps {
  products: any[];
}

export default function SimpleOrderForm({ products }: OrderFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const orderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest('/api/orders/simple', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been received. We'll contact you shortly to confirm.",
        variant: "default",
      });
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setSelectedProduct('');
      setQuantity(1);
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerPhone || !selectedProduct) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const selectedProductData = products.find(p => p.id === selectedProduct);
    
    orderMutation.mutate({
      customerName,
      customerPhone,
      productId: selectedProduct,
      productName: selectedProductData?.name,
      quantity,
      unitPrice: selectedProductData?.price,
      totalAmount: selectedProductData?.price * quantity,
    });
  };

  return (
    <Card className="max-w-md mx-auto" data-testid="simple-order-form">
      <CardHeader>
        <CardTitle className="text-center text-green-800 dark:text-green-200">
          Quick Order Form
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName">Your Name *</Label>
            <Input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your full name"
              required
              data-testid="input-customer-name"
            />
          </div>

          <div>
            <Label htmlFor="customerPhone">Phone Number *</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+254 700 000 000"
              required
              data-testid="input-customer-phone"
            />
          </div>

          <div>
            <Label htmlFor="product">Select Product *</Label>
            <select
              id="product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
              required
              data-testid="select-product"
            >
              <option value="">Choose a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - KSh {product.price}/{product.unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              data-testid="input-quantity"
            />
          </div>

          {selectedProduct && (
            <div className="bg-green-50 dark:bg-green-900 p-3 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Total: </strong>
                KSh {(products.find(p => p.id === selectedProduct)?.price * quantity || 0).toLocaleString()}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={orderMutation.isPending}
            data-testid="button-place-order"
          >
            {orderMutation.isPending ? 'Placing Order...' : 'Place Order'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}