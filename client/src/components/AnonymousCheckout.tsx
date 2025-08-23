import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { anonymousCart, generateAnonymousId, privacySettings } from '@/utils/privacy';
import { sanitizeText } from '@/utils/security';
import { ShoppingCart, User, Lock } from 'lucide-react';

const anonymousOrderSchema = z.object({
  contactEmail: z.string().email('Valid email required'),
  deliveryAddress: z.string().min(10, 'Complete address required'),
  city: z.string().min(2, 'City required'),
  postalCode: z.string().min(3, 'Postal code required'),
  phone: z.string().min(10, 'Valid phone number required'),
  specialInstructions: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val, 'Must agree to terms'),
  anonymousOrder: z.boolean().default(true),
});

type AnonymousOrderData = z.infer<typeof anonymousOrderSchema>;

interface AnonymousCheckoutProps {
  onComplete: (orderData: any) => void;
  onSwitchToLogin: () => void;
}

export function AnonymousCheckout({ onComplete, onSwitchToLogin }: AnonymousCheckoutProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cart = anonymousCart.get();
  
  const form = useForm<AnonymousOrderData>({
    resolver: zodResolver(anonymousOrderSchema),
    defaultValues: {
      anonymousOrder: true,
      agreeToTerms: false,
    },
  });

  const handleSubmit = async (data: AnonymousOrderData) => {
    setIsSubmitting(true);
    
    try {
      // Sanitize all text inputs
      const sanitizedData = {
        ...data,
        contactEmail: sanitizeText(data.contactEmail),
        deliveryAddress: sanitizeText(data.deliveryAddress),
        city: sanitizeText(data.city),
        postalCode: sanitizeText(data.postalCode),
        phone: sanitizeText(data.phone),
        specialInstructions: data.specialInstructions ? sanitizeText(data.specialInstructions) : '',
      };

      const orderData = {
        id: generateAnonymousId(),
        items: cart,
        delivery: sanitizedData,
        type: 'anonymous',
        timestamp: Date.now(),
        status: 'pending',
        tracking: {
          id: generateAnonymousId(),
          status: 'received'
        }
      };

      // Clear cart after order
      anonymousCart.clear();
      
      // Complete the order
      onComplete(orderData);
      
      toast({
        title: "Order Placed",
        description: "Your anonymous order has been submitted successfully!",
      });
      
    } catch (error) {
      console.error('Anonymous checkout error:', error);
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600">Add some fresh products to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Privacy Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800 mb-1">Anonymous Checkout</h3>
              <p className="text-sm text-green-700">
                Your order will be processed without creating an account. We'll only collect 
                the minimum information needed for delivery. Your data won't be stored permanently.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Switch to Login Option */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-900">Have an account?</h3>
                <p className="text-sm text-gray-600">Sign in for faster checkout and order tracking</p>
              </div>
            </div>
            <Button variant="outline" onClick={onSwitchToLogin}>
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Form */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Contact Email */}
            <div>
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="your@email.com"
                {...form.register('contactEmail')}
              />
              {form.formState.errors.contactEmail && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.contactEmail.message}
                </p>
              )}
            </div>

            {/* Delivery Address */}
            <div>
              <Label htmlFor="deliveryAddress">Delivery Address *</Label>
              <Input
                id="deliveryAddress"
                placeholder="123 Main Street, Apt 4B"
                {...form.register('deliveryAddress')}
              />
              {form.formState.errors.deliveryAddress && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.deliveryAddress.message}
                </p>
              )}
            </div>

            {/* City and Postal Code */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  {...form.register('city')}
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  placeholder="12345"
                  {...form.register('postalCode')}
                />
                {form.formState.errors.postalCode && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.postalCode.message}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                {...form.register('phone')}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* Special Instructions */}
            <div>
              <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
              <Input
                id="specialInstructions"
                placeholder="Leave at front door, etc."
                {...form.register('specialInstructions')}
              />
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={form.watch('agreeToTerms')}
                onCheckedChange={(checked) => form.setValue('agreeToTerms', checked as boolean)}
              />
              <Label htmlFor="agreeToTerms" className="text-sm leading-5">
                I agree to the <a href="/terms" className="text-green-600 hover:underline">Terms of Service</a> and 
                understand this is an anonymous order that will be processed without storing my personal data.
              </Label>
            </div>
            {form.formState.errors.agreeToTerms && (
              <p className="text-sm text-red-600">
                {form.formState.errors.agreeToTerms.message}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Place Anonymous Order"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Data Policy */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-gray-800 mb-2">Anonymous Order Policy</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Your order data will be deleted after 30 days</li>
            <li>• We don't track your browsing or store cookies</li>
            <li>• Contact email is only used for order updates</li>
            <li>• No marketing emails or data sharing</li>
            <li>• You can request data deletion anytime</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}