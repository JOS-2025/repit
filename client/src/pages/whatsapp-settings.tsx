import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WhatsAppOrderNotifications } from '@/components/WhatsAppOrderNotifications';
import Footer from '@/components/footer';
import { MessageCircle, Smartphone, Bell } from 'lucide-react';

export default function WhatsAppSettings() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp Notifications</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated on your orders with real-time WhatsApp notifications. Get instant updates on order status, delivery tracking, and more.
          </p>
        </div>

        {/* Feature Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              WhatsApp Integration Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Bell className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Instant Notifications</h3>
                <p className="text-sm text-gray-600">
                  Get real-time updates on your phone the moment your order status changes
                </p>
              </div>
              <div className="text-center">
                <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Two-Way Communication</h3>
                <p className="text-sm text-gray-600">
                  Chat directly with our bot for order updates and customer support
                </p>
              </div>
              <div className="text-center">
                <Smartphone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Mobile Convenience</h3>
                <p className="text-sm text-gray-600">
                  Receive notifications directly on WhatsApp - no need to check emails or apps
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Notifications Component */}
        <WhatsAppOrderNotifications />

        {/* FAQ Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">How do I set up WhatsApp notifications?</h3>
                <p className="text-sm text-gray-600">
                  Simply enter your WhatsApp phone number above and enable the notification types you want. 
                  Make sure to use the same number that's connected to your WhatsApp account.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Is my phone number secure?</h3>
                <p className="text-sm text-gray-600">
                  Yes, your phone number is only used for sending order notifications and is stored securely. 
                  We never share your number with third parties or use it for marketing purposes.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Can I disable notifications anytime?</h3>
                <p className="text-sm text-gray-600">
                  Absolutely! You can toggle any notification type on or off, or completely disable WhatsApp notifications 
                  by turning off all switches on this page.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">What if I don't receive notifications?</h3>
                <p className="text-sm text-gray-600">
                  Make sure your phone number is correct and that WhatsApp is installed on your device. 
                  You can use the "Send Test Message" button to verify everything is working properly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}