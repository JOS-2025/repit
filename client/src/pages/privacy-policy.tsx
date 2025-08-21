import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/navigation";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-green-700 dark:text-green-300">
              Privacy Policy
            </CardTitle>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8 p-8">
            
            {/* 1. Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                We respect your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and store your data when you use Farm2Customer.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>By using the app, you consent to this policy.</strong>
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                2. Information We Collect
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                    Personal Information:
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>Name</li>
                    <li>Phone number</li>
                    <li>Delivery address</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                    Non-Personal Information:
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>Device type</li>
                    <li>Browser information</li>
                    <li>IP address</li>
                    <li>App usage data (pages viewed, orders placed)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                We use your data to:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Process and fulfill orders</li>
                <li>Communicate order updates and promotions</li>
                <li>Improve our services and app experience</li>
                <li>Prevent fraud and abuse</li>
              </ul>
            </section>

            {/* 4. Sharing Information */}
            <section>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                4. Sharing Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                <strong>We do not sell or rent your data.</strong> We may share information with:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li><strong>Farmers</strong> - For order fulfillment</li>
                <li><strong>Payment providers</strong> - (e.g., M-Pesa) for processing payments</li>
                <li><strong>Delivery partners</strong> - To complete deliveries</li>
              </ul>
            </section>

            {/* 5. Data Storage and Security */}
            <section>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                5. Data Storage and Security
              </h2>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Your data is stored securely in Supabase servers</li>
                <li>We implement technical measures to prevent unauthorized access</li>
                <li>Access is restricted to authorized personnel only</li>
              </ul>
            </section>

            {/* 6. Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                6. Cookies and Tracking
              </h2>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Minimal tracking may be used to improve app performance and usability</li>
                <li>We do not sell or track users for advertising purposes in the MVP</li>
              </ul>
            </section>

            {/* 7. User Rights */}
            <section>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                7. User Rights
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Request access to your personal information</li>
                <li>Request correction or deletion of your data</li>
                <li>Unsubscribe from promotional messages at any time</li>
              </ul>
            </section>

            {/* 8. Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                8. Children's Privacy
              </h2>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Our app is not intended for children under 18</li>
                <li>We do not knowingly collect data from minors</li>
              </ul>
            </section>

            {/* 9. Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                9. Third-Party Services
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                We may use third-party services (e.g., M-Pesa, Supabase) that have their own privacy policies.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We encourage users to review those policies as well.
              </p>
            </section>

            {/* 10. Policy Updates */}
            <section>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                10. Policy Updates
              </h2>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>This policy may be updated occasionally</li>
                <li>Changes are effective immediately upon posting in the app</li>
                <li>Users should check the privacy page regularly</li>
              </ul>
            </section>

            {/* 11. Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                11. Contact Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                For questions or concerns about your data, email:{" "}
                <a 
                  href="mailto:contact@farm2customer.com" 
                  className="text-green-600 dark:text-green-400 hover:underline font-semibold"
                >
                  contact@farm2customer.com
                </a>
              </p>
            </section>

            {/* Footer */}
            <div className="border-t pt-6 mt-8">
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                By continuing to use Farm2Customer, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}