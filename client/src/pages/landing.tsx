import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
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
        products={products as any[]} 
        isLoading={productsLoading}
        showLoginPrompt={true}
      />
      
      <Footer />
    </div>
  );
}
