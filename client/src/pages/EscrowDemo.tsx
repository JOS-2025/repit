import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EscrowPaymentModal } from "@/components/EscrowPaymentModal";
import Footer from "@/components/footer";
import { 
  CreditCard, 
  Shield, 
  Truck, 
  CheckCircle, 
  Clock,
  DollarSign,
  Smartphone,
  Users,
  TrendingUp,
  Award
} from "lucide-react";

export function EscrowDemo() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Mock order data for demonstration
  const mockOrder = {
    orderId: "ORD-2024-001",
    farmerId: "farmer-123",
    farmerName: "Green Valley Farm",
    totalAmount: 2450.00,
    products: [
      { name: "Organic Tomatoes", quantity: 5, price: 200 },
      { name: "Fresh Spinach", quantity: 3, price: 150 },
      { name: "Sweet Potatoes", quantity: 10, price: 80 },
      { name: "Carrots", quantity: 2, price: 125 },
    ]
  };

  // Get basket templates data
  const { data: basketTemplates } = useQuery({
    queryKey: ['/api/baskets/templates'],
  });

  const ecosystemFeatures = [
    {
      icon: Shield,
      title: "Escrow Payment System",
      description: "Secure transactions with M-Pesa, Airtel Money integration",
      status: "Active",
      color: "green"
    },
    {
      icon: Truck,
      title: "Crowdsourced Delivery",
      description: "Boda boda riders with route optimization",
      status: "Beta",
      color: "blue"
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description: "Farm photos, certifications, and quality grades",
      status: "Active",
      color: "green"
    },
    {
      icon: Users,
      title: "Adopt a Farm",
      description: "Community program connecting customers with farmers",
      status: "New",
      color: "purple"
    },
    {
      icon: TrendingUp,
      title: "AI Demand Prediction",
      description: "Market trends and intelligent demand forecasting",
      status: "Coming Soon",
      color: "orange"
    },
    {
      icon: CheckCircle,
      title: "Blockchain Traceability",
      description: "IoT sensors and blockchain product tracking",
      status: "Development",
      color: "gray"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-green-600">FramCart Ecosystem</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Complete Agricultural Technology Platform with Escrow Payments, 
          Crowdsourced Delivery, Quality Assurance, and Community Features
        </p>
      </div>

      {/* Ecosystem Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ecosystemFeatures.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <IconComponent className={`h-8 w-8 text-${feature.color}-600`} />
                  <Badge 
                    variant={feature.status === "Active" ? "default" : "secondary"}
                    className={
                      feature.color === "green" ? "bg-green-100 text-green-800" :
                      feature.color === "blue" ? "bg-blue-100 text-blue-800" :
                      feature.color === "purple" ? "bg-purple-100 text-purple-800" :
                      feature.color === "orange" ? "bg-orange-100 text-orange-800" :
                      "bg-gray-100 text-gray-800"
                    }
                  >
                    {feature.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Escrow Payment Demo */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            Escrow Payment System Demo
          </CardTitle>
          <CardDescription>
            Experience secure farm-to-table payments with mobile money integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sample Order */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Sample Order from {mockOrder.farmerName}</h4>
            <div className="space-y-2">
              {mockOrder.products.map((product, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{product.name} x {product.quantity}kg</span>
                  <span>KSh {(product.price * product.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Total:</span>
                <span className="text-green-600">KSh {mockOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Flow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <h5 className="font-medium">1. Select Payment</h5>
              <p className="text-xs text-gray-600">Choose M-Pesa, Airtel Money, or Tigo Pesa</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <h5 className="font-medium">2. Mobile Payment</h5>
              <p className="text-xs text-gray-600">Complete payment on your phone</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-orange-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h5 className="font-medium">3. Funds Secured</h5>
              <p className="text-xs text-gray-600">Money held safely in escrow</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h5 className="font-medium">4. Release on Delivery</h5>
              <p className="text-xs text-gray-600">Farmer gets paid after confirmation</p>
            </div>
          </div>

          {/* Try Demo Button */}
          <div className="text-center">
            <Button 
              onClick={() => setShowPaymentModal(true)}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-try-escrow-demo"
            >
              <Shield className="h-5 w-5 mr-2" />
              Try Escrow Payment Demo
            </Button>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-medium text-green-800 mb-2">🛡️ Buyer Protection</h5>
              <p className="text-sm text-green-700">Money held until delivery confirmed</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2">📱 Mobile Money</h5>
              <p className="text-sm text-blue-700">Pay with M-Pesa, Airtel Money, Tigo Pesa</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h5 className="font-medium text-purple-800 mb-2">🔄 Dispute Resolution</h5>
              <p className="text-sm text-purple-700">Fair resolution for any issues</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ecosystem Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">20+</div>
            <div className="text-sm text-gray-600">New Database Tables</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">7</div>
            <div className="text-sm text-gray-600">Major Feature Domains</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-sm text-gray-600">Mobile Money Providers</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">100%</div>
            <div className="text-sm text-gray-600">Secure Transactions</div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <EscrowPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={mockOrder}
      />
      
      <Footer />
    </div>
  );
}