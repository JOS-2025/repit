import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Calendar, 
  Clock, 
  Package, 
  RotateCcw, 
  Pause, 
  Play, 
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface SubscriptionOrdersProps {
  productId?: string;
  productName?: string;
  currentPrice?: number;
  farmerId?: string;
}

interface SubscriptionOrder {
  id: string;
  productId: string;
  productName: string;
  farmerId: string;
  farmerName: string;
  quantity: number;
  frequency: string;
  nextDelivery: string;
  isActive: boolean;
  totalDeliveries: number;
  pricePerUnit: number;
  deliveryAddress: string;
  createdAt: string;
}

const FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly", description: "Every 7 days" },
  { value: "bi-weekly", label: "Bi-weekly", description: "Every 14 days" },
  { value: "monthly", label: "Monthly", description: "Every 30 days" },
  { value: "daily", label: "Daily", description: "Every day (for milk, eggs)" }
];

export default function SubscriptionOrders({ productId, productName, currentPrice, farmerId }: SubscriptionOrdersProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Fetch user's subscription orders
  const { data: subscriptions = [], isLoading } = useQuery<SubscriptionOrder[]>({
    queryKey: ['/api/subscription-orders'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/subscription-orders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-orders'] });
      setIsCreateModalOpen(false);
      toast({
        title: "Subscription Created",
        description: "Your recurring order has been set up successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle subscription status
  const toggleSubscriptionMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest("PUT", `/api/subscription-orders/${id}/toggle`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-orders'] });
      toast({
        title: "Subscription Updated",
        description: "Subscription status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update subscription.",
        variant: "destructive",
      });
    },
  });

  // Cancel subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/subscription-orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-orders'] });
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to cancel subscription.",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubscription = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const subscriptionData = {
      productId,
      farmerId,
      quantity: parseInt(formData.get('quantity') as string),
      frequency: formData.get('frequency') as string,
      deliveryAddress: formData.get('deliveryAddress') as string,
      pricePerUnit: currentPrice,
    };

    createSubscriptionMutation.mutate(subscriptionData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFrequencyLabel = (frequency: string) => {
    return FREQUENCY_OPTIONS.find(option => option.value === frequency)?.label || frequency;
  };

  if (!isAuthenticated) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4 text-center">
          <AlertCircle className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
          <p className="text-yellow-800">Please log in to set up subscription orders</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create Subscription Button */}
      {productId && (
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid="button-create-subscription"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Set Up Recurring Order
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-green-600" />
                Create Subscription Order
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateSubscription} className="space-y-4">
              <div>
                <Label htmlFor="product-info">Product</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold">{productName}</p>
                  <p className="text-sm text-gray-600">{formatCurrency(currentPrice || 0)} per unit</p>
                </div>
              </div>

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue="1"
                  required
                  data-testid="input-subscription-quantity"
                />
              </div>

              <div>
                <Label htmlFor="frequency">Delivery Frequency</Label>
                <Select name="frequency" required>
                  <SelectTrigger data-testid="select-subscription-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  placeholder="Enter your delivery address"
                  required
                  data-testid="textarea-delivery-address"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createSubscriptionMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-confirm-subscription"
                >
                  {createSubscriptionMutation.isPending ? "Creating..." : "Create Subscription"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Manage Subscriptions Button */}
      <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full"
            data-testid="button-manage-subscriptions"
          >
            <Package className="w-4 h-4 mr-2" />
            Manage My Subscriptions ({subscriptions.length})
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              My Subscription Orders
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No subscription orders yet</p>
              <p className="text-sm text-gray-500 mt-1">Set up recurring orders for your favorite products</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{subscription.productName}</h4>
                          <Badge 
                            className={subscription.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {subscription.isActive ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>🏪 {subscription.farmerName}</p>
                          <p>📦 {subscription.quantity} units every {getFrequencyLabel(subscription.frequency).toLowerCase()}</p>
                          <p>💰 {formatCurrency(subscription.pricePerUnit)} per unit</p>
                          <p>📅 Next delivery: {formatDate(subscription.nextDelivery)}</p>
                          <p>🚛 {subscription.totalDeliveries} deliveries completed</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleSubscriptionMutation.mutate({
                            id: subscription.id,
                            isActive: !subscription.isActive
                          })}
                          disabled={toggleSubscriptionMutation.isPending}
                          data-testid={`button-toggle-subscription-${subscription.id}`}
                        >
                          {subscription.isActive ? (
                            <>
                              <Pause className="w-4 h-4 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              Resume
                            </>
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this subscription?')) {
                              cancelSubscriptionMutation.mutate(subscription.id);
                            }
                          }}
                          disabled={cancelSubscriptionMutation.isPending}
                          data-testid={`button-cancel-subscription-${subscription.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Subscription Benefits Info */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Subscription Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p>• Never run out of your essentials (milk, eggs, vegetables)</p>
          <p>• Fixed pricing - no price fluctuations</p>
          <p>• Priority delivery scheduling</p>
          <p>• Pause or modify anytime</p>
          <p>• Track delivery history and patterns</p>
        </CardContent>
      </Card>
    </div>
  );
}