import { Phone, Mail, MessageCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 dark:text-green-200 mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            We're here to help you with any questions or issues
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card data-testid="contact-email-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-green-600" />
                Email Support
              </CardTitle>
              <CardDescription>
                Send us an email and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="mailto:farmcart@gmail.com" 
                className="text-green-600 hover:text-green-700 font-medium text-lg"
                data-testid="email-link"
              >
                farmcart@gmail.com
              </a>
            </CardContent>
          </Card>

          <Card data-testid="contact-phone-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-green-600" />
                Phone Support
              </CardTitle>
              <CardDescription>
                Call us directly for immediate assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="tel:+254795841161" 
                className="text-green-600 hover:text-green-700 font-medium text-lg"
                data-testid="phone-link"
              >
                +254 795 841 161
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card data-testid="faq-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-green-600" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  How do I place an order?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse our products, click on items you want, enter your name, phone number, and desired quantity in the order form, then submit your order.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  How do I become a farmer on FramCart?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Register as a farmer through our registration form. You'll need to provide your farm details and contact information for verification.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We accept M-Pesa payments and integrated payment gateway options for your convenience.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  How long does delivery take?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Delivery times vary based on location and product availability. Times are estimates and may be affected by traffic, weather, or other logistics factors.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Can I cancel my order?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Cancellation policies depend on individual farmers' policies. Contact the farmer directly or our support team for assistance.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="support-hours-card">
            <CardHeader>
              <CardTitle>Support Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM EAT</p>
                <p><strong>Saturday:</strong> 9:00 AM - 4:00 PM EAT</p>
                <p><strong>Sunday:</strong> 10:00 AM - 2:00 PM EAT</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}