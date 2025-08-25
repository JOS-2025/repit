import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Footer from "@/components/footer";
import { 
  Settings as SettingsIcon,
  Bell,
  Shield,
  CreditCard,
  Plus,
  Trash2,
  Check,
  Moon,
  Sun,
  Globe,
  Eye,
  EyeOff,
  Smartphone
} from "lucide-react";

interface UserPreferences {
  id?: string;
  userId: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  privacyShareData: boolean;
  privacyShowProfile: boolean;
  theme: string;
  language: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'mobile_money';
  cardLastFour?: string;
  cardBrand?: string;
  mobileProvider?: string;
  mobileNumber?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card' as 'card' | 'mobile_money',
    cardLastFour: '',
    cardBrand: '',
    mobileProvider: '',
    mobileNumber: ''
  });
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);

  // Fetch user preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['/api/user/preferences'],
    retry: false,
  });

  // Fetch payment methods
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ['/api/payment-methods'],
    retry: false,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      const response = await apiRequest('PUT', '/api/user/preferences', updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating settings",
        description: error instanceof Error ? error.message : "Failed to update preferences",
        variant: "destructive",
      });
    },
  });

  // Add payment method mutation
  const addPaymentMethodMutation = useMutation({
    mutationFn: async (paymentMethod: any) => {
      const response = await apiRequest('POST', '/api/payment-methods', paymentMethod);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment method added",
        description: "Your payment method has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      setShowAddPaymentDialog(false);
      setNewPaymentMethod({
        type: 'card',
        cardLastFour: '',
        cardBrand: '',
        mobileProvider: '',
        mobileNumber: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding payment method",
        description: error instanceof Error ? error.message : "Failed to add payment method",
        variant: "destructive",
      });
    },
  });

  // Delete payment method mutation
  const deletePaymentMethodMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await apiRequest('DELETE', `/api/payment-methods/${paymentMethodId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment method removed",
        description: "Your payment method has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
    },
    onError: (error) => {
      toast({
        title: "Error removing payment method",
        description: error instanceof Error ? error.message : "Failed to remove payment method",
        variant: "destructive",
      });
    },
  });

  // Set default payment method mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await apiRequest('PUT', `/api/payment-methods/${paymentMethodId}/set-default`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Default payment method updated",
        description: "Your default payment method has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating default payment method",
        description: error instanceof Error ? error.message : "Failed to update default payment method",
        variant: "destructive",
      });
    },
  });

  const handlePreferenceChange = (field: keyof UserPreferences, value: any) => {
    updatePreferencesMutation.mutate({ [field]: value });
  };

  const handleAddPaymentMethod = () => {
    if (newPaymentMethod.type === 'card') {
      if (!newPaymentMethod.cardLastFour || !newPaymentMethod.cardBrand) {
        toast({
          title: "Invalid card details",
          description: "Please provide both card last four digits and card brand.",
          variant: "destructive",
        });
        return;
      }
    } else if (newPaymentMethod.type === 'mobile_money') {
      if (!newPaymentMethod.mobileProvider || !newPaymentMethod.mobileNumber) {
        toast({
          title: "Invalid mobile money details",
          description: "Please provide both mobile provider and phone number.",
          variant: "destructive",
        });
        return;
      }
    }

    addPaymentMethodMutation.mutate(newPaymentMethod);
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    if (method.type === 'card') {
      return <CreditCard className="w-4 h-4" />;
    } else {
      return <Smartphone className="w-4 h-4" />;
    }
  };

  const getPaymentMethodDisplay = (method: PaymentMethod) => {
    if (method.type === 'card') {
      return `${method.cardBrand?.toUpperCase()} ****${method.cardLastFour}`;
    } else {
      return `${method.mobileProvider?.toUpperCase()} ${method.mobileNumber}`;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl" data-testid="settings-page">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preferences" data-testid="tab-preferences">
            <Bell className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="privacy" data-testid="tab-privacy">
            <Shield className="w-4 h-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-payments">
            <CreditCard className="w-4 h-4 mr-2" />
            Payments
          </TabsTrigger>
        </TabsList>

        {/* Notification Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card data-testid="card-notifications">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {preferencesLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="notifications-enabled">All Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable or disable all notifications
                      </p>
                    </div>
                    <Switch
                      id="notifications-enabled"
                      data-testid="switch-notifications-enabled"
                      checked={(preferences as UserPreferences)?.notificationsEnabled ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange('notificationsEnabled', checked)}
                      disabled={updatePreferencesMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      data-testid="switch-email-notifications"
                      checked={(preferences as UserPreferences)?.emailNotifications ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                      disabled={updatePreferencesMutation.isPending || !(preferences as UserPreferences)?.notificationsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      data-testid="switch-push-notifications"
                      checked={(preferences as UserPreferences)?.pushNotifications ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                      disabled={updatePreferencesMutation.isPending || !(preferences as UserPreferences)?.notificationsEnabled}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-appearance">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5" />
                Appearance & Language
              </CardTitle>
              <CardDescription>
                Customize your app appearance and language preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={(preferences as UserPreferences)?.theme ?? 'light'}
                  onValueChange={(value) => handlePreferenceChange('theme', value)}
                  disabled={preferencesLoading || updatePreferencesMutation.isPending}
                >
                  <SelectTrigger data-testid="select-theme">
                    <SelectValue placeholder="Choose theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Dark
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={(preferences as UserPreferences)?.language ?? 'en'}
                  onValueChange={(value) => handlePreferenceChange('language', value)}
                  disabled={preferencesLoading || updatePreferencesMutation.isPending}
                >
                  <SelectTrigger data-testid="select-language">
                    <SelectValue placeholder="Choose language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        English
                      </div>
                    </SelectItem>
                    <SelectItem value="sw">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Kiswahili
                      </div>
                    </SelectItem>
                    <SelectItem value="fr">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Français
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card data-testid="card-privacy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control how your data is used and shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {preferencesLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="share-data">Share Usage Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve FramCart by sharing anonymous usage data
                      </p>
                    </div>
                    <Switch
                      id="share-data"
                      data-testid="switch-share-data"
                      checked={(preferences as UserPreferences)?.privacyShareData ?? false}
                      onCheckedChange={(checked) => handlePreferenceChange('privacyShareData', checked)}
                      disabled={updatePreferencesMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="show-profile">Show Profile Publicly</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow other users to see your public profile information
                      </p>
                    </div>
                    <Switch
                      id="show-profile"
                      data-testid="switch-show-profile"
                      checked={(preferences as UserPreferences)?.privacyShowProfile ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange('privacyShowProfile', checked)}
                      disabled={updatePreferencesMutation.isPending}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods */}
        <TabsContent value="payments" className="space-y-6">
          <Card data-testid="card-payment-methods">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>
                    Manage your payment methods for easy checkout
                  </CardDescription>
                </div>
                <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-payment">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-add-payment">
                    <DialogHeader>
                      <DialogTitle>Add Payment Method</DialogTitle>
                      <DialogDescription>
                        Add a new payment method to your account
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Payment Type</Label>
                        <Select
                          value={newPaymentMethod.type}
                          onValueChange={(value: 'card' | 'mobile_money') => 
                            setNewPaymentMethod(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger data-testid="select-payment-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newPaymentMethod.type === 'card' && (
                        <>
                          <div className="space-y-2">
                            <Label>Card Brand</Label>
                            <Select
                              value={newPaymentMethod.cardBrand}
                              onValueChange={(value) => 
                                setNewPaymentMethod(prev => ({ ...prev, cardBrand: value }))
                              }
                            >
                              <SelectTrigger data-testid="select-card-brand">
                                <SelectValue placeholder="Select card brand" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="visa">Visa</SelectItem>
                                <SelectItem value="mastercard">Mastercard</SelectItem>
                                <SelectItem value="amex">American Express</SelectItem>
                                <SelectItem value="discover">Discover</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Last Four Digits</Label>
                            <Input
                              data-testid="input-card-last-four"
                              placeholder="1234"
                              value={newPaymentMethod.cardLastFour}
                              onChange={(e) => 
                                setNewPaymentMethod(prev => ({ ...prev, cardLastFour: e.target.value }))
                              }
                              maxLength={4}
                            />
                          </div>
                        </>
                      )}

                      {newPaymentMethod.type === 'mobile_money' && (
                        <>
                          <div className="space-y-2">
                            <Label>Mobile Provider</Label>
                            <Select
                              value={newPaymentMethod.mobileProvider}
                              onValueChange={(value) => 
                                setNewPaymentMethod(prev => ({ ...prev, mobileProvider: value }))
                              }
                            >
                              <SelectTrigger data-testid="select-mobile-provider">
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mpesa">M-Pesa</SelectItem>
                                <SelectItem value="airtel_money">Airtel Money</SelectItem>
                                <SelectItem value="orange_money">Orange Money</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                              data-testid="input-mobile-number"
                              placeholder="+254700000000"
                              value={newPaymentMethod.mobileNumber}
                              onChange={(e) => 
                                setNewPaymentMethod(prev => ({ ...prev, mobileNumber: e.target.value }))
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddPaymentDialog(false)}
                        data-testid="button-cancel-payment"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddPaymentMethod}
                        disabled={addPaymentMethodMutation.isPending}
                        data-testid="button-save-payment"
                      >
                        {addPaymentMethodMutation.isPending ? "Adding..." : "Add Payment Method"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {paymentMethodsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                        <div className="space-y-1">
                          <div className="h-4 bg-muted rounded animate-pulse w-24" />
                          <div className="h-3 bg-muted rounded animate-pulse w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (paymentMethods as PaymentMethod[])?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payment methods added yet</p>
                  <p className="text-sm">Add a payment method to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(paymentMethods as PaymentMethod[])?.map((method: PaymentMethod) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`payment-method-${method.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        {getPaymentMethodIcon(method)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{getPaymentMethodDisplay(method)}</p>
                            {method.isDefault && (
                              <Badge variant="secondary" data-testid="badge-default">
                                <Check className="w-3 h-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">
                            {method.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDefaultMutation.mutate(method.id)}
                            disabled={setDefaultMutation.isPending}
                            data-testid={`button-set-default-${method.id}`}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePaymentMethodMutation.mutate(method.id)}
                          disabled={deletePaymentMethodMutation.isPending || method.isDefault}
                          data-testid={`button-delete-${method.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Footer />
    </div>
  );
}