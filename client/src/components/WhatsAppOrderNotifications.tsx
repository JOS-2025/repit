import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Bell, BellOff, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface WhatsAppNotificationSettings {
  orderConfirmation: boolean;
  orderUpdates: boolean;
  deliveryNotifications: boolean;
  paymentReminders: boolean;
  phoneNumber: string;
}

interface WhatsAppStatus {
  isReady: boolean;
  clientInfo?: {
    phone: string;
    name: string;
    platform: string;
  };
  timestamp: string;
}

export function WhatsAppOrderNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<WhatsAppNotificationSettings>({
    orderConfirmation: true,
    orderUpdates: true,
    deliveryNotifications: true,
    paymentReminders: false,
    phoneNumber: ''
  });

  // Get WhatsApp bot status
  const { data: whatsappStatus, isLoading: statusLoading } = useQuery<WhatsAppStatus>({
    queryKey: ['/api/whatsapp/status'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Update notification settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: WhatsAppNotificationSettings) => {
      return apiRequest('PUT', '/api/user/whatsapp-settings', newSettings);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your WhatsApp notification preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/whatsapp-settings'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update WhatsApp settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Send test notification
  const sendTestMutation = useMutation({
    mutationFn: async () => {
      if (!settings.phoneNumber) {
        throw new Error('Phone number is required');
      }
      return apiRequest('POST', '/api/whatsapp/test', {
        phone: settings.phoneNumber,
        message: '🌱 Test message from FramCart! Your WhatsApp notifications are working correctly.'
      });
    },
    onSuccess: () => {
      toast({
        title: "Test Message Sent",
        description: "Check your WhatsApp for the test message!",
      });
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Failed to send test message",
        variant: "destructive",
      });
    }
  });

  const handleSettingChange = (key: keyof WhatsAppNotificationSettings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleSendTest = () => {
    sendTestMutation.mutate();
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Bot Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            WhatsApp Bot Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
              <span className="text-gray-600">Checking status...</span>
            </div>
          ) : whatsappStatus ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Connection Status</span>
                <Badge variant={whatsappStatus.isReady ? "default" : "destructive"} className="bg-green-100 text-green-800">
                  {whatsappStatus.isReady ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Connected
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Disconnected
                    </div>
                  )}
                </Badge>
              </div>
              
              {whatsappStatus.clientInfo && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div><strong>Bot Number:</strong> {formatPhoneNumber(whatsappStatus.clientInfo.phone)}</div>
                    <div><strong>Name:</strong> {whatsappStatus.clientInfo.name}</div>
                    <div><strong>Platform:</strong> {whatsappStatus.clientInfo.platform}</div>
                  </div>
                </div>
              )}
              
              {!whatsappStatus.isReady && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    <strong>Setup Required:</strong> The WhatsApp bot needs to be connected. 
                    Please scan the QR code in the server console to connect your WhatsApp Business account.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Unable to check WhatsApp status</div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              WhatsApp Phone Number
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={settings.phoneNumber}
              onChange={(e) => handleSettingChange('phoneNumber', e.target.value)}
              className="max-w-sm"
            />
            <p className="text-sm text-gray-600">
              Enter your WhatsApp number to receive order notifications
            </p>
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Notification Types</h3>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Order Confirmations</div>
                  <div className="text-sm text-gray-600">Get notified when your order is confirmed</div>
                </div>
                <Switch
                  checked={settings.orderConfirmation}
                  onCheckedChange={(checked) => handleSettingChange('orderConfirmation', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Order Updates</div>
                  <div className="text-sm text-gray-600">Receive updates about order status changes</div>
                </div>
                <Switch
                  checked={settings.orderUpdates}
                  onCheckedChange={(checked) => handleSettingChange('orderUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Delivery Notifications</div>
                  <div className="text-sm text-gray-600">Get notified about delivery status and driver details</div>
                </div>
                <Switch
                  checked={settings.deliveryNotifications}
                  onCheckedChange={(checked) => handleSettingChange('deliveryNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Payment Reminders</div>
                  <div className="text-sm text-gray-600">Receive reminders for pending payments</div>
                </div>
                <Switch
                  checked={settings.paymentReminders}
                  onCheckedChange={(checked) => handleSettingChange('paymentReminders', checked)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleSendTest}
              variant="outline"
              disabled={!settings.phoneNumber || !whatsappStatus?.isReady || sendTestMutation.isPending}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {sendTestMutation.isPending ? 'Sending...' : 'Send Test Message'}
            </Button>
            
            <Button
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">About WhatsApp Notifications</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Receive real-time updates about your orders directly on WhatsApp</li>
                <li>• Get delivery tracking information and driver contact details</li>
                <li>• Chat with our support team for order assistance</li>
                <li>• Your phone number is only used for order notifications</li>
                <li>• You can disable notifications anytime from this page</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}