import Navigation from "@/components/navigation";

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
      </div>
    </div>
  );
};

export default About;