import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 dark:text-green-200 mb-4">
            Terms and Conditions
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please read these terms carefully before using FramCart
          </p>
        </div>

        <Card data-testid="terms-content">
          <CardContent className="p-6">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-8">
                
                <section data-testid="app-purpose">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    1. App Purpose
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    FramCart is a farm-to-table marketplace platform that connects farmers directly with customers, 
                    eliminating intermediaries and providing customers access to fresh, locally-sourced agricultural products.
                  </p>
                </section>

                <section data-testid="definitions">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    2. Definitions
                  </h2>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p><strong>"Customer"</strong> - Any individual who uses the platform to browse and purchase farm products.</p>
                    <p><strong>"Farmer"</strong> - Verified agricultural producers who list and sell their products through the platform.</p>
                    <p><strong>"App/Platform"</strong> - FramCart marketplace application and all its services.</p>
                  </div>
                </section>

                <section data-testid="agreement">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    3. Agreement to Terms
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    By using FramCart, you agree to be bound by these Terms and Conditions. If you do not agree 
                    to these terms, please do not use our platform.
                  </p>
                </section>

                <section data-testid="age-requirement">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    4. Age Requirement
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Users must be 18 years or older to use this platform. Users under 18 must have legal guardian 
                    consent and supervision when using FramCart.
                  </p>
                </section>

                <section data-testid="verification">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    5. Customer Verification
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Customers must be verified before listing products. All farmers undergo a verification process 
                    to ensure authenticity and quality of products offered on the platform.
                  </p>
                </section>

                <section data-testid="account-registration">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    6. Account Registration
                  </h2>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>• Users need to create an account to place orders through the platform.</p>
                    <p>• Users are responsible for keeping their login information secure and confidential.</p>
                    <p>• The app is not responsible for account misuse due to compromised login credentials.</p>
                  </div>
                </section>

                <section data-testid="product-listings-orders">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    7. Product Listings and Orders
                  </h2>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>• Farmers are responsible for providing accurate descriptions including quality, price, and weight.</p>
                    <p>• Prices may change and are confirmed at checkout.</p>
                    <p>• Customers must provide accurate information when placing orders.</p>
                    <p>• The app does not guarantee product supply as orders depend on availability.</p>
                  </div>
                </section>

                <section data-testid="payments">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    8. Payments
                  </h2>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>• Payments are processed via M-Pesa or integrated payment gateway.</p>
                    <p>• Users authorize payment when placing orders.</p>
                    <p>• Refunds or cancellations depend on individual farmers' policies.</p>
                    <p>• The app is not liable for failed or delayed payments.</p>
                  </div>
                </section>

                <section data-testid="delivery">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    9. Delivery
                  </h2>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>• Delivery times are estimates and subject to traffic, weather, and logistics factors.</p>
                    <p>• Customers are responsible for receiving orders at the provided address.</p>
                    <p>• Farmers and riders are not liable for delays outside their control.</p>
                  </div>
                </section>

                <section data-testid="user-conduct">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    10. User Conduct
                  </h2>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>• No misuse of the platform including fake orders, harassment, or illegal activities.</p>
                    <p>• Customers must respect farmers' rights and vice versa.</p>
                    <p>• The app reserves the right to suspend or terminate accounts for violations.</p>
                  </div>
                </section>

                <section data-testid="liability-disclaimer">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    11. Liability Disclaimer
                  </h2>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>• Products are sold "as-is" with freshness and quality depending on farmers.</p>
                    <p>• The app is a platform connecting buyers and sellers, not a party in the sale.</p>
                    <p>• The app is not liable for personal injury, food spoilage, or indirect losses.</p>
                  </div>
                </section>

                <section data-testid="privacy">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    12. Privacy
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Users' personal information is collected and used according to our Privacy Policy. 
                    We are committed to protecting your privacy and personal data.
                  </p>
                </section>

                <section data-testid="intellectual-property">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    13. Intellectual Property
                  </h2>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>• App content including logo, UI, and text is owned by FramCart.</p>
                    <p>• Users cannot copy or redistribute app content without explicit permission.</p>
                  </div>
                </section>

                <section data-testid="termination">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    14. Termination
                  </h2>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>• Users may delete their accounts at any time.</p>
                    <p>• The app may suspend or terminate accounts for violations of these terms.</p>
                  </div>
                </section>

                <section data-testid="changes-to-terms">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    15. Changes to Terms
                  </h2>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>• The app can update Terms and Conditions at any time.</p>
                    <p>• Changes are effective immediately upon posting.</p>
                    <p>• Users should review terms regularly to stay informed of updates.</p>
                  </div>
                </section>

                <section data-testid="governing-law">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    16. Governing Law
                  </h2>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>• These Terms and Conditions are governed by the laws of Kenya.</p>
                    <p>• For dispute resolution, parties should first try mediation.</p>
                    <p>• If mediation fails, disputes will be resolved through Kenyan courts.</p>
                  </div>
                </section>

                <section data-testid="contact-info">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    17. Contact Information
                  </h2>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p>For questions about these Terms and Conditions, contact us:</p>
                    <p><strong>Email:</strong> farmcart@gmail.com</p>
                    <p><strong>Phone:</strong> +254 795 841 161</p>
                  </div>
                </section>

                <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}