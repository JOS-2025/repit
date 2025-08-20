import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="bg-gradient-to-r from-farm-green to-farm-green-dark text-white py-16 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
          Fresh From Farm to Your Table
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Connect directly with local farmers for the freshest produce
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button 
              className="bg-white text-farm-green px-8 py-3 hover:bg-gray-50 font-semibold"
              data-testid="button-browse-products"
            >
              Browse Products
            </Button>
          </Link>
          {isAuthenticated && !user?.farmer ? (
            <Link href="/farmer-dashboard">
              <Button 
                variant="outline"
                className="border-2 border-white text-white px-8 py-3 hover:bg-white hover:text-farm-green font-semibold"
                data-testid="button-become-farmer-partner"
              >
                Become a Farmer Partner
              </Button>
            </Link>
          ) : !isAuthenticated ? (
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/api/login"}
              className="border-2 border-white text-white px-8 py-3 hover:bg-white hover:text-farm-green font-semibold"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
