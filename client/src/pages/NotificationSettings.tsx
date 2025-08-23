import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Trash2, Settings, Users, Tag, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProductSubscription {
  id: string;
  subscriptionType: 'category' | 'farmer' | 'all';
  targetId?: string;
  category?: string;
  isActive: boolean;
  notificationMethods: string[];
  createdAt: string;
}

interface NotificationStats {
  totalSent: number;
  totalFailed: number;
  recentNotifications: any[];
}

export default function NotificationSettings() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user subscriptions
  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['/api/product-subscriptions'],
    enabled: isAuthenticated,
  });

  // Fetch notification stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/product-notifications/stats'],
    enabled: isAuthenticated,
  });

  // Fetch farmers for subscription creation
  const { data: farmers } = useQuery({
    queryKey: ['/api/farmers'],
    enabled: isAuthenticated,
  });

  const subscriptionsList = (subscriptions || []) as ProductSubscription[];
  const notificationStats = (stats || {}) as NotificationStats;
  const farmersList = (farmers || []) as any[];

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest('PUT', `/api/product-subscriptions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-subscriptions'] });
      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  // Delete subscription mutation
  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/product-subscriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-subscriptions'] });
      toast({
        title: "Success",
        description: "Subscription deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscription",
        variant: "destructive",
      });
    },
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/product-subscriptions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-subscriptions'] });
      toast({
        title: "Success",
        description: "Subscription created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  const getSubscriptionIcon = (type: string) => {
    switch (type) {
      case 'category':
        return <Tag className="h-4 w-4" />;
      case 'farmer':
        return <Users className="h-4 w-4" />;
      case 'all':
        return <Globe className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSubscriptionLabel = (subscription: ProductSubscription) => {
    switch (subscription.subscriptionType) {
      case 'category':
        return `${subscription.category} products`;
      case 'farmer':
        const farmer = farmersList.find((f: any) => f.id === subscription.targetId);
        return farmer ? `${farmer.farmName} products` : 'Farmer products';
      case 'all':
        return 'All new products';
      default:
        return 'Unknown subscription';
    }
  };

  const toggleSubscriptionActive = (subscription: ProductSubscription) => {
    updateSubscriptionMutation.mutate({
      id: subscription.id,
      data: {
        isActive: !subscription.isActive,
        notificationMethods: subscription.notificationMethods,
      },
    });
  };

  const updateNotificationMethods = (subscription: ProductSubscription, methods: string[]) => {
    updateSubscriptionMutation.mutate({
      id: subscription.id,
      data: {
        isActive: subscription.isActive,
        notificationMethods: methods,
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign in to manage notifications</h2>
            <p className="text-muted-foreground">
              Please sign in to set up product notifications and manage your subscription preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl" data-testid="notification-settings">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
        <p className="text-muted-foreground">
          Manage your product notification preferences and get alerts when new products are available.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">
                  {subscriptionsLoading ? "..." : subscriptionsList.filter(s => s.isActive).length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notifications Sent</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? "..." : notificationStats.totalSent || 0}
                </p>
              </div>
              <Settings className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Notifications</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? "..." : notificationStats.totalFailed || 0}
                </p>
              </div>
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Subscriptions</CardTitle>
            <CreateSubscriptionDialog
              farmers={farmersList}
              onCreate={(data: any) => createSubscriptionMutation.mutate(data)}
              isCreating={createSubscriptionMutation.isPending}
            />
          </div>
        </CardHeader>
        <CardContent>
          {subscriptionsLoading ? (
            <div className="text-center py-8">Loading subscriptions...</div>
          ) : subscriptionsList.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No subscriptions yet</p>
              <p className="text-muted-foreground mb-4">
                Create your first subscription to get notified about new products.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptionsList.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onToggleActive={() => toggleSubscriptionActive(subscription)}
                  onUpdateMethods={(methods: string[]) => updateNotificationMethods(subscription, methods)}
                  onDelete={() => deleteSubscriptionMutation.mutate(subscription.id)}
                  getIcon={getSubscriptionIcon}
                  getLabel={getSubscriptionLabel}
                  isUpdating={updateSubscriptionMutation.isPending}
                  isDeleting={deleteSubscriptionMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Subscription Card Component
function SubscriptionCard({ 
  subscription, 
  onToggleActive, 
  onUpdateMethods, 
  onDelete, 
  getIcon, 
  getLabel,
  isUpdating,
  isDeleting 
}: {
  subscription: ProductSubscription;
  onToggleActive: () => void;
  onUpdateMethods: (methods: string[]) => void;
  onDelete: () => void;
  getIcon: (type: string) => JSX.Element;
  getLabel: (subscription: ProductSubscription) => string;
  isUpdating: boolean;
  isDeleting: boolean;
}) {
  const [methodsOpen, setMethodsOpen] = useState(false);

  return (
    <Card className={`border-l-4 ${subscription.isActive ? 'border-l-green-500' : 'border-l-gray-300'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getIcon(subscription.subscriptionType)}
            <div>
              <p className="font-medium">{getLabel(subscription)}</p>
              <p className="text-sm text-muted-foreground">
                Methods: {subscription.notificationMethods.join(', ')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={subscription.isActive ? "default" : "secondary"}>
              {subscription.isActive ? "Active" : "Inactive"}
            </Badge>
            
            <Switch
              checked={subscription.isActive}
              onCheckedChange={onToggleActive}
              disabled={isUpdating}
              data-testid={`switch-subscription-${subscription.id}`}
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMethodsOpen(!methodsOpen)}
              data-testid={`button-methods-${subscription.id}`}
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              data-testid={`button-delete-${subscription.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {methodsOpen && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <Label className="text-sm font-medium">Notification Methods:</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {['push', 'whatsapp', 'email'].map((method) => (
                <label key={method} className="flex items-center space-x-2">
                  <Checkbox
                    checked={subscription.notificationMethods.includes(method)}
                    onCheckedChange={(checked) => {
                      const newMethods = checked
                        ? [...subscription.notificationMethods, method]
                        : subscription.notificationMethods.filter((m: string) => m !== method);
                      onUpdateMethods(newMethods);
                    }}
                    disabled={isUpdating}
                    data-testid={`checkbox-${method}-${subscription.id}`}
                  />
                  <span className="text-sm capitalize">{method}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Create Subscription Dialog Component
function CreateSubscriptionDialog({ 
  farmers, 
  onCreate, 
  isCreating 
}: {
  farmers: any[];
  onCreate: (data: any) => void;
  isCreating: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<'category' | 'farmer' | 'all'>('all');
  const [targetId, setTargetId] = useState('');
  const [category, setCategory] = useState('');
  const [notificationMethods, setNotificationMethods] = useState(['push']);

  const categories = [
    'Vegetables', 'Fruits', 'Grains', 'Herbs', 'Dairy', 'Meat', 'Poultry', 'Seafood'
  ];

  const handleSubmit = () => {
    const data: any = {
      subscriptionType,
      notificationMethods,
    };

    if (subscriptionType === 'farmer') {
      data.targetId = targetId;
    } else if (subscriptionType === 'category') {
      data.category = category;
    }

    onCreate(data);
    setOpen(false);
  };

  const canSubmit = () => {
    if (subscriptionType === 'farmer' && !targetId) return false;
    if (subscriptionType === 'category' && !category) return false;
    return notificationMethods.length > 0;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-subscription">
          <Plus className="h-4 w-4 mr-2" />
          Add Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Subscription</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label>Subscription Type</Label>
            <Select value={subscriptionType} onValueChange={(value: 'category' | 'farmer' | 'all') => setSubscriptionType(value)}>
              <SelectTrigger data-testid="select-subscription-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All new products</SelectItem>
                <SelectItem value="category">Specific category</SelectItem>
                <SelectItem value="farmer">Specific farmer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {subscriptionType === 'category' && (
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {subscriptionType === 'farmer' && (
            <div>
              <Label>Farmer</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger data-testid="select-farmer">
                  <SelectValue placeholder="Select farmer" />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map((farmer: any) => (
                    <SelectItem key={farmer.id} value={farmer.id}>
                      {farmer.farmName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Notification Methods</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {['push', 'whatsapp', 'email'].map((method) => (
                <label key={method} className="flex items-center space-x-2">
                  <Checkbox
                    checked={notificationMethods.includes(method)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNotificationMethods([...notificationMethods, method]);
                      } else {
                        setNotificationMethods(notificationMethods.filter(m => m !== method));
                      }
                    }}
                    data-testid={`checkbox-create-${method}`}
                  />
                  <span className="text-sm capitalize">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!canSubmit() || isCreating}
            data-testid="button-create"
          >
            {isCreating ? "Creating..." : "Create Subscription"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}