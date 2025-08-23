import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* About FramCart */}
          <div>
            <h3 className="text-lg font-semibold mb-4">FramCart</h3>
            <p className="text-gray-300 text-sm mb-4">
              Connecting farmers directly with customers for fresh, locally-sourced produce.
            </p>
            <Link 
              href="/about" 
              className="text-green-400 hover:text-green-300 text-sm"
              data-testid="footer-about"
            >
              Learn More →
            </Link>
          </div>
          
          {/* For Customers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Customers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white" data-testid="footer-products">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-white" data-testid="footer-categories">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="text-gray-300 hover:text-white" data-testid="footer-recommendations">
                  AI Recommendations
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-300 hover:text-white" data-testid="footer-orders">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-gray-300 hover:text-white" data-testid="footer-wishlist">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>
          
          {/* For Farmers & Business */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Farmers & Business</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white" data-testid="footer-farmer-register">
                  Become a Farmer
                </Link>
              </li>
              <li>
                <Link href="/farmer-dashboard" className="text-gray-300 hover:text-white" data-testid="footer-farmer-dashboard">
                  Farmer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/b2b" className="text-gray-300 hover:text-white" data-testid="footer-b2b">
                  B2B Solutions
                </Link>
              </li>
              <li>
                <Link href="/b2b/register" className="text-gray-300 hover:text-white" data-testid="footer-b2b-register">
                  Business Registration
                </Link>
              </li>
              <li>
                <Link href="/b2b/bulk-orders" className="text-gray-300 hover:text-white" data-testid="footer-bulk-orders">
                  Bulk Orders
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support & Community */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support & Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white" data-testid="footer-help">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-300 hover:text-white" data-testid="footer-community">
                  Community Forums
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-gray-300 hover:text-white" data-testid="footer-settings">
                  Settings
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white" data-testid="footer-terms">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white" data-testid="footer-privacy">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 FramCart. All rights reserved. | Connecting Farmers & Customers
          </p>
        </div>
      </div>
    </footer>
  );
}