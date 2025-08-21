import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/navigation';
import LiveTrackingMap from '@/components/live-tracking-map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle,
  Search,
  Truck,
  Route,
  AlertCircle
} from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  status: string;
  totalAmount: number;
  deliveryAddress: string;
  phoneNumber: string;
  createdAt: string;
  orderItems: Array<{
    productName: string;
    quantity: number;
    pricePerUnit: number;
  }>;
}

export default function OrderTrackingLive() {
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [activeTrackingId, setActiveTrackingId] = useState('');
  
  const { isAuthenticated, user } = useAuth();

  // Get user's orders for authenticated users
  const { data: userOrders = [] } = useQuery({
    queryKey: ['/api/orders/customer'],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  const handleTrackOrder = () => {
    if (trackingOrderId.trim()) {
      setActiveTrackingId(trackingOrderId.trim());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'harvested': return 'bg-purple-100 text-purple-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'harvested': return <Package className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canTrackOrder = (status: string) => {
    return ['in_transit', 'confirmed', 'harvested'].includes(status.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
            <Route className="w-8 h-8 text-green-600" />
            Order Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Track your farm-fresh deliveries in real-time
          </p>
        </div>

        {/* Order ID Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Track by Order ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 max-w-md">
              <Input
                placeholder="Enter your order ID"
                value={trackingOrderId}
                onChange={(e) => setTrackingOrderId(e.target.value)}
                data-testid="order-id-input"
              />
              <Button 
                onClick={handleTrackOrder}
                className="bg-green-600 hover:bg-green-700"
                data-testid="track-order-button"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Track
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Enter your order ID to see live delivery tracking and GPS location
            </p>
          </CardContent>
        </Card>

        {/* Live Tracking */}
        {activeTrackingId && (
          <div className="mb-8">
            <LiveTrackingMap 
              orderId={activeTrackingId} 
              orderNumber={activeTrackingId.slice(-8)}
            />
          </div>
        )}

        {/* User's Orders (if authenticated) */}
        {isAuthenticated && userOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Your Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userOrders.map((order: Order) => (
                  <Card key={order.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">
                            Order #{order.id.slice(-8)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">
                              {order.status.replace('_', ' ')}
                            </span>
                          </Badge>
                          <p className="text-lg font-semibold mt-1">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Items:</h5>
                        <div className="space-y-1">
                          {order.orderItems.map((item, index) => (
                            <div key={index} className="text-sm text-gray-700 flex justify-between">
                              <span>{item.productName} x {item.quantity}</span>
                              <span>{formatCurrency(item.pricePerUnit * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-1">Delivery Address:</h5>
                        <p className="text-sm text-gray-700">{order.deliveryAddress}</p>
                        {order.phoneNumber && (
                          <p className="text-sm text-gray-600 mt-1">Contact: {order.phoneNumber}</p>
                        )}
                      </div>

                      {/* Tracking Actions */}
                      <div className="flex gap-2">
                        {canTrackOrder(order.status) ? (
                          <Button
                            onClick={() => setActiveTrackingId(order.id)}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`track-order-${order.id}`}
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Track Live Location
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            disabled
                            className="cursor-not-allowed opacity-50"
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            GPS Tracking Not Available
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State for Non-authenticated Users */}
        {!isAuthenticated && !activeTrackingId && (
          <Card className="text-center p-8">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Your Orders</h3>
            <p className="text-gray-600 mb-4">
              Enter your order ID above to track your farm-fresh delivery in real-time.
              Sign in to see all your order history and get automatic tracking updates.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-green-600 hover:bg-green-700"
            >
              Sign In to View Order History
            </Button>
          </Card>
        )}

        {/* Empty State for Authenticated Users with No Orders */}
        {isAuthenticated && userOrders.length === 0 && !activeTrackingId && (
          <Card className="text-center p-8">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't placed any orders yet. Start shopping for fresh, farm-to-table produce!
            </p>
            <Button 
              onClick={() => window.location.href = '/products'}
              className="bg-green-600 hover:bg-green-700"
            >
              Browse Products
            </Button>
          </Card>
        )}

        {/* Tracking Features Info */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Route className="w-5 h-5" />
              Real-Time GPS Tracking Features
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-blue-900">Live Location</p>
                  <p className="text-blue-700">See your driver's current location on the map</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-blue-900">ETA Updates</p>
                  <p className="text-blue-700">Get accurate estimated arrival times</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-blue-900">Delivery Status</p>
                  <p className="text-blue-700">Real-time updates on pickup and transit</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}