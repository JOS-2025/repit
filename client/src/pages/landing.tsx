import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import CategoryFilter from "@/components/category-filter";
import ProductGrid from "@/components/product-grid";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isLoading]);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      <HeroSection />
      <CategoryFilter />
      <ProductGrid 
        products={products} 
        isLoading={productsLoading}
        showLoginPrompt={true}
      />
      
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <i className="fas fa-seedling text-farm-green text-2xl mr-2"></i>
                <span className="text-2xl font-bold">FramCart</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting farmers directly with customers for fresh, quality produce.
              </p>
              <div className="flex space-x-4">
                <i className="fab fa-facebook text-gray-400 hover:text-white cursor-pointer"></i>
                <i className="fab fa-twitter text-gray-400 hover:text-white cursor-pointer"></i>
                <i className="fab fa-instagram text-gray-400 hover:text-white cursor-pointer"></i>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Browse Products</a></li>
                <li><a href="#" className="hover:text-white">Track Orders</a></li>
                <li><a href="#" className="hover:text-white">Customer Support</a></li>
                <li><a href="#" className="hover:text-white">Payment Options</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Farmers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Join as Farmer</a></li>
                <li><a href="#" className="hover:text-white">Farmer Dashboard</a></li>
                <li><a href="#" className="hover:text-white">Seller Resources</a></li>
                <li><a href="#" className="hover:text-white">Verification Process</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2023 FramCart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
