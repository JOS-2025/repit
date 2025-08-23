import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

const About = () => {
  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-farm-green mb-4" data-testid="text-about-title">About FramCart</h1>
        <p className="text-gray-700 mb-4" data-testid="text-about-description">
          FramCart is a farmer-to-customer platform designed to bring fresh, organic produce
          straight from farms to your table. We eliminate middlemen, ensuring farmers get fair
          prices and customers receive fresh, affordable products.
        </p>
        <h2 className="text-xl font-semibold mb-2" data-testid="text-mission-title">Our Mission</h2>
        <p className="text-gray-700 mb-4" data-testid="text-mission-description">
          To empower local farmers, reduce food waste, and provide a transparent marketplace
          for healthy and sustainable food.
        </p>
        <h2 className="text-xl font-semibold mb-2" data-testid="text-benefits-title">Why Choose Us?</h2>
        <ul className="list-disc list-inside text-gray-700" data-testid="list-benefits">
          <li>Fresh produce directly from farms</li>
          <li>Fair prices for farmers</li>
          <li>Fast and secure delivery</li>
          <li>Eco-friendly sourcing</li>
        </ul>
        
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-cta-title">
            Join Our Community
          </h3>
          <p className="text-gray-600 mb-6" data-testid="text-cta-description">
            Start selling your fresh produce or access farm-fresh products today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = "/api/login"}
              className="bg-farm-green text-white px-8 py-3 rounded-lg font-medium hover:bg-farm-green-dark transition-colors"
              data-testid="button-register-farmer"
            >
              Register as a Farmer
            </button>
            <button
              onClick={() => window.location.href = "/api/login"}
              className="bg-white text-farm-green border-2 border-farm-green px-8 py-3 rounded-lg font-medium hover:bg-farm-green hover:text-white transition-colors"
              data-testid="button-farmer-login"
            >
              Already a Farmer? Log In
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;