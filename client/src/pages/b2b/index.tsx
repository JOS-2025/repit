import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Package, TrendingUp, Users, DollarSign, CheckCircle, ArrowRight, ShoppingCart } from "lucide-react";

export default function B2BIndex() {
  const { user, isAuthenticated } = useAuth();

  // Check if user has a business account
  const { data: businessProfile, isLoading: isLoadingBusiness } = useQuery<any>({
    queryKey: ["/api/business/profile"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              FramCart B2B Solutions
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect directly with farmers for bulk orders, volume discounts, and recurring deliveries
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" data-testid="button-login">
              <a href="/api/login" className="flex items-center">
                Sign In to Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Building className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Business Registration</CardTitle>
                <CardDescription>
                  Register your business for verified B2B access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Business license verification
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Dedicated account manager
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Priority customer support
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Package className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Bulk Ordering</CardTitle>
                <CardDescription>
                  Place large volume orders with volume discounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Volume-based pricing tiers
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Flexible delivery schedules
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Recurring order automation
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Business Analytics</CardTitle>
                <CardDescription>
                  Track spending, orders, and supplier relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Detailed spending insights
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Order history tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Invoice management
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!businessProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to FramCart B2B
            </h1>
            <p className="text-lg text-gray-600">
              Complete your business registration to unlock wholesale pricing and bulk ordering
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Register Your Business</CardTitle>
              <CardDescription>
                Join thousands of businesses sourcing fresh produce directly from farmers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Volume discounts up to 30%
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Flexible payment terms
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Dedicated account support
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Priority delivery slots
                </div>
              </div>
              
              <div className="text-center pt-6">
                <Link href="/b2b/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700" data-testid="button-register-business">
                    Start Business Registration
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User has a business profile - show dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {businessProfile?.businessName || 'Business Dashboard'}
            </h1>
            <div className="flex items-center mt-2">
              <Badge 
                variant={businessProfile?.verificationStatus === 'verified' ? 'default' : 'secondary'}
                className={businessProfile?.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : ''}
              >
                {businessProfile?.verificationStatus === 'verified' ? 'Verified Business' : 'Pending Verification'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">--</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">$--</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">--</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Savings</p>
                  <p className="text-2xl font-bold text-gray-900">--%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Access your most used B2B features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/b2b/bulk-orders">
                <Button variant="outline" className="w-full justify-start" data-testid="button-bulk-orders">
                  <Package className="mr-2 h-4 w-4" />
                  Place Bulk Order
                </Button>
              </Link>
              <Link href="/b2b/suppliers">
                <Button variant="outline" className="w-full justify-start" data-testid="button-suppliers">
                  <Users className="mr-2 h-4 w-4" />
                  Find Suppliers
                </Button>
              </Link>
              <Link href="/b2b/invoices">
                <Button variant="outline" className="w-full justify-start" data-testid="button-invoices">
                  <DollarSign className="mr-2 h-4 w-4" />
                  View Invoices
                </Button>
              </Link>
              <Link href="/b2b/analytics">
                <Button variant="outline" className="w-full justify-start" data-testid="button-analytics">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Business Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest orders and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Place your first bulk order to get started</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}