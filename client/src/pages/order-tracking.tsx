import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function OrderTracking() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: orders = [], isLoading: ordersLoading, error } = useQuery({
    queryKey: ["/api/orders/customer"],
    retry: false,
    enabled: !!user,
  });

  // Handle unauthorized error
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800", 
      harvested: "bg-green-100 text-green-800",
      in_transit: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const getProgressSteps = (status: string) => {
    const steps = [
      { key: 'confirmed', label: 'Order Confirmed', icon: 'fas fa-check' },
      { key: 'harvested', label: 'Harvested', icon: 'fas fa-seedling' },
      { key: 'in_transit', label: 'In Transit', icon: 'fas fa-truck' },
      { key: 'delivered', label: 'Delivered', icon: 'fas fa-home' }
    ];

    const statusOrder = ['confirmed', 'harvested', 'in_transit', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-seedling text-farm-green text-4xl mb-4 animate-pulse"></i>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Orders</h1>
          <p className="text-gray-600">
            Monitor your fresh produce deliveries from farm to table
          </p>
        </div>

        {/* WhatsApp Bot Integration Display */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-500 p-3 rounded-full">
                <i className="fab fa-whatsapp text-white text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp Order Assistant</h3>
                <p className="text-gray-600">Get real-time updates via WhatsApp</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-robot text-white text-sm"></i>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex-1">
                  <p className="text-sm text-gray-900">
                    Hello! Your recent orders are being tracked. You'll receive updates as they progress through harvesting and delivery.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-green-500 text-white rounded-lg px-4 py-2 inline-block">
                  <p className="text-sm">Thanks for the updates!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {ordersLoading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <i className="fas fa-shopping-bag text-6xl text-gray-300 mb-6"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-500 mb-6">Start shopping for fresh farm produce to see your orders here.</p>
              <a 
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-farm-green text-white rounded-lg hover:bg-farm-green-dark transition-colors"
                data-testid="link-browse-products"
              >
                Browse Products
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <Card key={order.id} data-testid={`card-order-${order.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-order-title-${order.id}`}>
                        Order #{order.id.slice(-8)}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)} data-testid={`badge-order-status-${order.id}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="flex items-center gap-3">
                      <img 
                        src={order.farmer?.user?.profileImageUrl || "https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"} 
                        alt="Farmer" 
                        className="w-12 h-12 rounded-full object-cover" 
                      />
                      <div>
                        <p className="font-medium text-gray-900" data-testid={`text-farm-name-${order.id}`}>
                          {order.farmer?.farmName}
                        </p>
                        <p className="text-sm text-gray-500">Your farmer</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <img 
                        src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60" 
                        alt="Delivery truck" 
                        className="w-12 h-12 rounded-full object-cover" 
                      />
                      <div>
                        <p className="font-medium text-gray-900">Express Delivery</p>
                        <p className="text-sm text-gray-500">Delivery partner</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900" data-testid={`text-order-total-${order.id}`}>
                        Total: KSh {parseFloat(order.totalAmount || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.orderItems?.length} items
                      </p>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      {getProgressSteps(order.status).map((step, index, array) => (
                        <div key={step.key} className="flex flex-col items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-farm-green' : step.current ? 'bg-orange-500' : 'bg-gray-300'
                          }`}>
                            <i className={`${step.icon} text-white text-sm`}></i>
                          </div>
                          <p className="text-xs text-gray-600 mt-2 text-center">{step.label}</p>
                          {index < array.length - 1 && (
                            <div className={`flex-1 h-0.5 ${
                              step.completed ? 'bg-farm-green' : 'bg-gray-300'
                            } mx-2 mt-4 absolute left-1/2 transform -translate-x-1/2 w-full`}></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div>
                      <Separator className="mb-4" />
                      <h4 className="font-semibold text-gray-900 mb-3">Order Items:</h4>
                      <div className="space-y-2">
                        {order.orderItems.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-gray-900">
                              {item.product?.name} x {item.quantity}
                            </span>
                            <span className="font-medium">
                              KSh {(parseFloat(item.pricePerUnit) * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Update */}
                  {order.status === 'in_transit' && (
                    <div className="mt-4 bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-info-circle text-blue-600"></i>
                        <p className="font-medium text-blue-900">Delivery Update</p>
                      </div>
                      <p className="text-sm text-blue-800">
                        Your order is currently being transported to your location. 
                        Expected delivery: Today between 2:00 PM - 4:00 PM
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
