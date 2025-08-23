import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Plus, Minus, ShoppingCart, CalendarIcon, Truck, DollarSign, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

const bulkOrderItemSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Price must be positive"),
});

const bulkOrderSchema = z.object({
  farmerId: z.string().min(1, "Please select a farmer"),
  deliveryDate: z.string().min(1, "Please select delivery date"),
  specialInstructions: z.string().optional(),
  items: z.array(bulkOrderItemSchema).min(1, "Please add at least one item"),
});

type BulkOrderForm = z.infer<typeof bulkOrderSchema>;
type BulkOrderItem = z.infer<typeof bulkOrderItemSchema>;

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  farmer: {
    businessName: string;
  };
}

export default function BulkOrders() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<BulkOrderItem[]>([]);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  // Check if user has a business account
  const { data: businessProfile } = useQuery<any>({
    queryKey: ["/api/business/profile"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Get products for bulk ordering
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  // Get existing bulk orders
  const { data: bulkOrders = [], isLoading: isLoadingOrders } = useQuery<any[]>({
    queryKey: ["/api/bulk-orders"],
    enabled: isAuthenticated && !!businessProfile,
  });

  const form = useForm<BulkOrderForm>({
    resolver: zodResolver(bulkOrderSchema),
    defaultValues: {
      farmerId: "",
      deliveryDate: "",
      specialInstructions: "",
      items: [],
    },
  });

  const createBulkOrderMutation = useMutation({
    mutationFn: async (data: BulkOrderForm) => {
      return await apiRequest("POST", "/api/bulk-orders", data);
    },
    onSuccess: () => {
      toast({
        title: "Bulk Order Created",
        description: "Your bulk order has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bulk-orders"] });
      setIsOrderDialogOpen(false);
      setSelectedItems([]);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to create bulk order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addItem = (product: Product) => {
    const existingItem = selectedItems.find(item => item.productId === product.id);
    if (existingItem) {
      setSelectedItems(items =>
        items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems(items => [
        ...items,
        {
          productId: product.id,
          quantity: 1,
          unitPrice: parseFloat(product.price),
        }
      ]);
    }
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setSelectedItems(items =>
        items.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeItem = (productId: string) => {
    setSelectedItems(items => items.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const onSubmit = (data: BulkOrderForm) => {
    const orderData = {
      ...data,
      items: selectedItems,
      totalAmount: calculateTotal(),
    };
    createBulkOrderMutation.mutate(orderData);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access bulk ordering
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!businessProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Business Registration Required</CardTitle>
              <CardDescription>
                You need to register your business to access bulk ordering features
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/b2b/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Register Your Business
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/b2b">
            <Button variant="ghost" className="mb-4" data-testid="button-back-to-b2b">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to B2B Dashboard
            </Button>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bulk Orders
              </h1>
              <p className="text-lg text-gray-600">
                Place large volume orders with volume discounts and flexible delivery
              </p>
            </div>
            <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700" data-testid="button-new-bulk-order">
                  <Plus className="mr-2 h-4 w-4" />
                  New Bulk Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Bulk Order</DialogTitle>
                  <DialogDescription>
                    Select products and quantities for your bulk order
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Available Products</h3>
                    {isLoadingProducts ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {products.map((product) => (
                          <Card key={product.id} className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{product.name}</h4>
                                <p className="text-sm text-gray-600">{product.farmer?.businessName}</p>
                                <p className="text-sm font-medium text-green-600">
                                  ${product.price}/{product.unit}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addItem(product)}
                                data-testid={`button-add-product-${product.id}`}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Selected Items ({selectedItems.length})</h3>
                    {selectedItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No items selected</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto mb-6">
                        {selectedItems.map((item) => {
                          const product = products.find((p) => p.id === item.productId);
                          return (
                            <Card key={item.productId} className="p-3">
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{product?.name}</h4>
                                  <p className="text-xs text-gray-600">${item.unitPrice}/{product?.unit}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                                    data-testid={`button-decrease-${item.productId}`}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                                    data-testid={`button-increase-${item.productId}`}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeItem(item.productId)}
                                    data-testid={`button-remove-${item.productId}`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}

                    {selectedItems.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center font-medium text-lg">
                          <span>Total:</span>
                          <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {selectedItems.length > 0 && (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                          <FormField
                            control={form.control}
                            name="deliveryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preferred Delivery Date</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                    min={new Date().toISOString().split('T')[0]}
                                    data-testid="input-delivery-date"
                                  />
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
                                    data-testid="textarea-special-instructions"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            size="lg"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={createBulkOrderMutation.isPending || selectedItems.length === 0}
                            data-testid="button-submit-bulk-order"
                          >
                            {createBulkOrderMutation.isPending ? (
                              <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                Creating Order...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Create Bulk Order
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Bulk Orders</CardTitle>
            <CardDescription>
              Track and manage your bulk orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : bulkOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No bulk orders yet</p>
                <p className="text-sm">Create your first bulk order to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Final Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkOrders.map((order: any) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell className="font-medium">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{order.farmerName}</TableCell>
                      <TableCell>${order.totalAmount?.toFixed(2)}</TableCell>
                      <TableCell>
                        {order.discountPercent > 0 ? (
                          <Badge variant="secondary">
                            {order.discountPercent.toFixed(1)}% off
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${order.finalAmount?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'pending' ? 'secondary' :
                            order.status === 'cancelled' ? 'destructive' : 'secondary'
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.deliveryDate ? format(new Date(order.deliveryDate), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" data-testid={`button-view-order-${order.id}`}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}