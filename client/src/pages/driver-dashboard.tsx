import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Navigation as NavigationIcon,
  Clock, 
  Phone,
  Package,
  CheckCircle,
  AlertCircle,
  Route,
  Timer,
  User,
  Car,
  Truck,
  Bike
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DeliveryAssignment {
  id: string;
  orderId: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  estimatedArrival?: string;
  distanceKm?: number;
  orderItems: Array<{
    productName: string;
    quantity: number;
    farmerName: string;
  }>;
  createdAt: string;
}

export default function DriverDashboard() {
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  
  const { isAuthenticated, user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get driver profile and assignments
  const { data: driverProfile } = useQuery({
    queryKey: ['/api/driver/profile'],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['/api/driver/assignments'],
    enabled: isAuthenticated && !!user,
    retry: false,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async (location: {lat: number; lng: number}) => {
      const response = await fetch('/api/driver/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update location');
      }
      
      return response.json();
    },
    onError: (error: any) => {
      console.error('Location update failed:', error);
    },
  });

  // Update delivery status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ deliveryId, status, location }: { 
      deliveryId: string; 
      status: string;
      location?: {lat: number; lng: number};
    }) => {
      const response = await fetch(`/api/driver/delivery/${deliveryId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          latitude: location?.lat,
          longitude: location?.lng,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver/assignments'] });
      toast({
        title: "Status Updated",
        description: "Delivery status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update delivery status",
        variant: "destructive",
      });
    },
  });

  // Start/Stop location tracking
  const toggleLocationTracking = () => {
    if (isTrackingLocation) {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setIsTrackingLocation(false);
      toast({
        title: "Location Tracking Stopped",
        description: "GPS tracking has been disabled",
      });
    } else {
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentLocation(location);
            updateLocationMutation.mutate(location);
          },
          (error) => {
            console.error('Geolocation error:', error);
            toast({
              title: "Location Error",
              description: "Unable to access GPS location",
              variant: "destructive",
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          }
        );
        setWatchId(id);
        setIsTrackingLocation(true);
        toast({
          title: "Location Tracking Started",
          description: "GPS tracking is now active",
        });
      } else {
        toast({
          title: "GPS Not Available",
          description: "Your device doesn't support GPS location",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return <Package className="w-4 h-4" />;
      case 'picked_up': return <NavigationIcon className="w-4 h-4" />;
      case 'in_transit': return <Route className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'motorcycle': return <Bike className="w-5 h-5" />;
      case 'bicycle': return <Bike className="w-5 h-5" />;
      case 'car': return <Car className="w-5 h-5" />;
      case 'truck': return <Truck className="w-5 h-5" />;
      default: return <Car className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openMap = (address: string, lat?: number, lng?: number) => {
    if (lat && lng) {
      window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
    }
  };

  const handleStatusUpdate = (deliveryId: string, newStatus: string) => {
    updateStatusMutation.mutate({
      deliveryId,
      status: newStatus,
      location: currentLocation || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center p-8 max-w-md mx-auto">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Driver Access Required</h2>
            <p className="text-gray-600 mb-4">
              Please sign in with your driver account to access the delivery dashboard
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-green-600 hover:bg-green-700"
            >
              Sign In
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const assignmentsArray = Array.isArray(assignments) ? assignments as DeliveryAssignment[] : [];
  const activeAssignments = assignmentsArray.filter(a => !['delivered', 'cancelled'].includes(a.status));

  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Route className="w-8 h-8 text-green-600" />
              Delivery Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage your delivery assignments and track locations
            </p>
          </div>
          
          {/* Location Toggle */}
          <div className="flex items-center gap-4">
            {currentLocation && (
              <div className="text-sm text-gray-600">
                <MapPin className="w-4 h-4 inline mr-1" />
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </div>
            )}
            <Button
              onClick={toggleLocationTracking}
              variant={isTrackingLocation ? "destructive" : "default"}
              className={`${isTrackingLocation ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              data-testid="toggle-location-tracking"
            >
              <NavigationIcon className="w-4 h-4 mr-2" />
              {isTrackingLocation ? 'Stop Tracking' : 'Start GPS Tracking'}
            </Button>
          </div>
        </div>

        {/* Driver Profile */}
        {driverProfile && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {getVehicleIcon(driverProfile.vehicleType)}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{driverProfile.driverName}</h3>
                  <p className="text-gray-600">
                    {driverProfile.vehicleType} • {driverProfile.vehicleNumber}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={driverProfile.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {driverProfile.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">{driverProfile.phoneNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Assignments Summary */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {assignmentsArray.filter(a => a.status === 'assigned').length}
              </div>
              <div className="text-sm text-gray-600">Assigned</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <NavigationIcon className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {assignmentsArray.filter(a => a.status === 'picked_up').length}
              </div>
              <div className="text-sm text-gray-600">Picked Up</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Route className="w-8 h-8 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {assignmentsArray.filter(a => a.status === 'in_transit').length}
              </div>
              <div className="text-sm text-gray-600">In Transit</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {assignmentsArray.filter(a => a.status === 'delivered').length}
              </div>
              <div className="text-sm text-gray-600">Delivered Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {assignmentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : assignmentsArray.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments</h3>
                <p className="text-gray-600">You don't have any delivery assignments at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignmentsArray.map((assignment) => (
                  <Card key={assignment.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">Order #{assignment.orderId.slice(-8)}</h4>
                          <p className="text-sm text-gray-600">
                            {assignment.customerName} • {assignment.customerPhone}
                          </p>
                        </div>
                        <Badge className={getStatusColor(assignment.status)}>
                          {getStatusIcon(assignment.status)}
                          <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>

                      {/* Addresses */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            Pickup Location
                          </h5>
                          <p className="text-sm text-blue-800 mb-2">{assignment.pickupAddress}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openMap(assignment.pickupAddress, assignment.pickupLatitude, assignment.pickupLongitude)}
                            className="text-blue-700 border-blue-300"
                          >
                            <MapPin className="w-3 h-3 mr-1" />
                            Open Map
                          </Button>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h5 className="font-medium text-green-900 mb-2 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            Delivery Location
                          </h5>
                          <p className="text-sm text-green-800 mb-2">{assignment.deliveryAddress}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openMap(assignment.deliveryAddress, assignment.deliveryLatitude, assignment.deliveryLongitude)}
                            className="text-green-700 border-green-300"
                          >
                            <MapPin className="w-3 h-3 mr-1" />
                            Open Map
                          </Button>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Items to Deliver:</h5>
                        <div className="space-y-1">
                          {assignment.orderItems.map((item, index) => (
                            <div key={index} className="text-sm text-gray-700 flex justify-between">
                              <span>{item.productName} x {item.quantity}</span>
                              <span className="text-gray-500">from {item.farmerName}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {assignment.status === 'assigned' && (
                          <Button
                            onClick={() => handleStatusUpdate(assignment.id, 'picked_up')}
                            disabled={updateStatusMutation.isPending}
                            className="bg-purple-600 hover:bg-purple-700"
                            data-testid={`pickup-${assignment.id}`}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Mark as Picked Up
                          </Button>
                        )}
                        
                        {assignment.status === 'picked_up' && (
                          <Button
                            onClick={() => handleStatusUpdate(assignment.id, 'in_transit')}
                            disabled={updateStatusMutation.isPending}
                            className="bg-orange-600 hover:bg-orange-700"
                            data-testid={`transit-${assignment.id}`}
                          >
                            <Route className="w-4 h-4 mr-2" />
                            Start Delivery
                          </Button>
                        )}
                        
                        {assignment.status === 'in_transit' && (
                          <Button
                            onClick={() => handleStatusUpdate(assignment.id, 'delivered')}
                            disabled={updateStatusMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`deliver-${assignment.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Delivered
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          onClick={() => window.open(`tel:${assignment.customerPhone}`)}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call Customer
                        </Button>
                        
                        {assignment.estimatedArrival && (
                          <div className="flex items-center text-sm text-gray-600 ml-auto">
                            <Clock className="w-4 h-4 mr-1" />
                            ETA: {formatDate(assignment.estimatedArrival)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}