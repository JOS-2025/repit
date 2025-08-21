import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation,
  Clock, 
  Phone,
  RefreshCw,
  Route,
  Package,
  Truck
} from 'lucide-react';

interface LiveTrackingProps {
  orderId: string;
  orderNumber: string;
}

interface TrackingData {
  orderId: string;
  status: string;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  vehicleNumber: string;
  currentLatitude?: number;
  currentLongitude?: number;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedArrival?: string;
  distanceKm?: number;
  lastUpdate: string;
  locationHistory: Array<{
    latitude: number;
    longitude: number;
    recordedAt: string;
    speed?: number;
  }>;
}

export default function LiveTrackingMap({ orderId, orderNumber }: LiveTrackingProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);

  // Get live tracking data
  const { data: trackingData, isLoading, refetch } = useQuery<TrackingData>({
    queryKey: ['/api/tracking', orderId],
    refetchInterval: 15000, // Update every 15 seconds
    retry: false,
  });

  // Load Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map when loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !trackingData) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { 
        lat: trackingData.currentLatitude || -1.2921, 
        lng: trackingData.currentLongitude || 36.8219 
      }, // Default to Nairobi
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    googleMapRef.current = map;

    // Add pickup marker
    if (trackingData.pickupAddress) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: trackingData.pickupAddress }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          new google.maps.Marker({
            position: results[0].geometry.location,
            map: map,
            title: 'Pickup Location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3B82F6"/>
                  <circle cx="12" cy="9" r="2.5" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 32)
            }
          });
        }
      });
    }

    // Add delivery marker
    if (trackingData.deliveryAddress) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: trackingData.deliveryAddress }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          new google.maps.Marker({
            position: results[0].geometry.location,
            map: map,
            title: 'Delivery Location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#10B981"/>
                  <circle cx="12" cy="9" r="2.5" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 32)
            }
          });
        }
      });
    }

    return () => {
      googleMapRef.current = null;
    };
  }, [mapLoaded, trackingData]);

  // Update driver marker when position changes
  useEffect(() => {
    if (!googleMapRef.current || !trackingData?.currentLatitude || !trackingData?.currentLongitude) return;

    const driverPosition = {
      lat: trackingData.currentLatitude,
      lng: trackingData.currentLongitude
    };

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setPosition(driverPosition);
    } else {
      driverMarkerRef.current = new google.maps.Marker({
        position: driverPosition,
        map: googleMapRef.current,
        title: `Driver: ${trackingData.driverName}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#F59E0B" stroke="white" stroke-width="2"/>
              <path d="M8 11V9h8v2h-2v6h-4v-6H8z" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
        }
      });
    }

    // Center map on driver location
    googleMapRef.current.setCenter(driverPosition);
  }, [trackingData?.currentLatitude, trackingData?.currentLongitude, trackingData?.driverName]);

  // Draw route history
  useEffect(() => {
    if (!googleMapRef.current || !trackingData?.locationHistory?.length) return;

    const routePath = trackingData.locationHistory.map(point => ({
      lat: point.latitude,
      lng: point.longitude
    }));

    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
    }

    routePolylineRef.current = new google.maps.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: '#10B981',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: googleMapRef.current
    });
  }, [trackingData?.locationHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const formatETA = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </CardContent>
      </Card>
    );
  }

  if (!trackingData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tracking Not Available</h3>
          <p className="text-gray-600">
            GPS tracking information is not available for this order yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Tracking Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5 text-green-600" />
              Live Tracking - Order #{orderNumber}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              data-testid="refresh-tracking"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Driver Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold">{trackingData.driverName}</h4>
                  <p className="text-sm text-gray-600">
                    {trackingData.vehicleType} • {trackingData.vehicleNumber}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`tel:${trackingData.driverPhone}`)}
                  className="ml-auto"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(trackingData.status)}>
                  <Package className="w-3 h-3 mr-1" />
                  {trackingData.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-500">
                  Last update: {formatTimeAgo(trackingData.lastUpdate)}
                </span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="space-y-3">
              {trackingData.estimatedArrival && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    ETA: {formatETA(trackingData.estimatedArrival)}
                  </span>
                </div>
              )}
              
              {trackingData.distanceKm && (
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-green-600" />
                  <span className="text-sm">
                    Distance: {trackingData.distanceKm.toFixed(1)} km
                  </span>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                <p><strong>Pickup:</strong> {trackingData.pickupAddress}</p>
                <p><strong>Delivery:</strong> {trackingData.deliveryAddress}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Live Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!mapLoaded ? (
            <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : (
            <div>
              <div ref={mapRef} className="h-96 w-full rounded-lg border" />
              
              {/* Map Legend */}
              <div className="flex justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Pickup Location</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Driver Current Location</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Delivery Location</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-1 bg-green-500"></div>
                  <span>Route Traveled</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Location History */}
      {trackingData.locationHistory && trackingData.locationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5 text-purple-600" />
              Recent Movement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {trackingData.locationHistory.slice(-5).reverse().map((point, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                  </span>
                  <div className="flex items-center gap-2">
                    {point.speed && (
                      <span className="text-blue-600">{point.speed.toFixed(0)} km/h</span>
                    )}
                    <span className="text-gray-500">
                      {formatTimeAgo(point.recordedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}