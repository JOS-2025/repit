import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { db } from './db';
import { deliveryDrivers, deliveryTracking, locationHistory } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

// WebSocket connections for real-time tracking
const trackingConnections = new Map<string, Set<WebSocket>>();

export function setupGPSTracking(httpServer: Server) {
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws/tracking' 
  });

  wss.on('connection', (ws: WebSocket, request) => {
    const url = new URL(request.url!, `http://${request.headers.host}`);
    const orderId = url.searchParams.get('orderId');
    
    if (!orderId) {
      ws.close(1008, 'Order ID required');
      return;
    }

    // Add connection to tracking set
    if (!trackingConnections.has(orderId)) {
      trackingConnections.set(orderId, new Set());
    }
    trackingConnections.get(orderId)!.add(ws);

    console.log(`Client connected to tracking for order ${orderId}`);

    // Send initial tracking data
    sendTrackingUpdate(orderId);

    ws.on('close', () => {
      const connections = trackingConnections.get(orderId);
      if (connections) {
        connections.delete(ws);
        if (connections.size === 0) {
          trackingConnections.delete(orderId);
        }
      }
      console.log(`Client disconnected from tracking for order ${orderId}`);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

export async function sendTrackingUpdate(orderId: string) {
  const connections = trackingConnections.get(orderId);
  if (!connections || connections.size === 0) return;

  try {
    // Get current tracking data
    const [tracking] = await db
      .select({
        orderId: deliveryTracking.orderId,
        status: deliveryTracking.status,
        currentLatitude: deliveryTracking.currentLatitude,
        currentLongitude: deliveryTracking.currentLongitude,
        estimatedArrival: deliveryTracking.estimatedArrival,
        distanceKm: deliveryTracking.distanceKm,
        updatedAt: deliveryTracking.updatedAt,
        driverName: deliveryDrivers.driverName,
        driverPhone: deliveryDrivers.phoneNumber,
        vehicleType: deliveryDrivers.vehicleType,
        vehicleNumber: deliveryDrivers.vehicleNumber,
      })
      .from(deliveryTracking)
      .leftJoin(deliveryDrivers, eq(deliveryTracking.driverId, deliveryDrivers.id))
      .where(eq(deliveryTracking.orderId, orderId))
      .limit(1);

    if (!tracking) return;

    // Get recent location history
    const recentLocations = await db
      .select({
        latitude: locationHistory.latitude,
        longitude: locationHistory.longitude,
        recordedAt: locationHistory.recordedAt,
        speed: locationHistory.speed,
      })
      .from(locationHistory)
      .innerJoin(deliveryTracking, eq(locationHistory.deliveryTrackingId, deliveryTracking.id))
      .where(eq(deliveryTracking.orderId, orderId))
      .orderBy(desc(locationHistory.recordedAt))
      .limit(20);

    const updateData = {
      type: 'tracking_update',
      data: {
        ...tracking,
        locationHistory: recentLocations.reverse(), // Oldest first for route display
      }
    };

    // Broadcast to all connected clients for this order
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(updateData));
      }
    });

  } catch (error) {
    console.error('Error sending tracking update:', error);
  }
}

export async function updateDriverLocation(
  driverId: string, 
  latitude: number, 
  longitude: number
): Promise<void> {
  try {
    // Update driver's current location
    await db
      .update(deliveryDrivers)
      .set({
        currentLatitude: latitude.toString(),
        currentLongitude: longitude.toString(),
        lastLocationUpdate: new Date(),
      })
      .where(eq(deliveryDrivers.id, driverId));

    // Get active deliveries for this driver
    const activeDeliveries = await db
      .select({
        id: deliveryTracking.id,
        orderId: deliveryTracking.orderId,
      })
      .from(deliveryTracking)
      .where(
        and(
          eq(deliveryTracking.driverId, driverId),
          eq(deliveryTracking.status, 'in_transit')
        )
      );

    // Update delivery tracking locations and add to location history
    for (const delivery of activeDeliveries) {
      // Update current location in delivery tracking
      await db
        .update(deliveryTracking)
        .set({
          currentLatitude: latitude.toString(),
          currentLongitude: longitude.toString(),
          updatedAt: new Date(),
        })
        .where(eq(deliveryTracking.id, delivery.id));

      // Add to location history
      await db.insert(locationHistory).values({
        deliveryTrackingId: delivery.id,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        recordedAt: new Date(),
      });

      // Send real-time update to connected clients
      await sendTrackingUpdate(delivery.orderId);
    }

  } catch (error) {
    console.error('Error updating driver location:', error);
    throw error;
  }
}

export async function calculateETA(
  currentLat: number,
  currentLng: number,
  destLat: number,
  destLng: number,
  avgSpeedKmh: number = 40
): Promise<number> {
  // Calculate distance using Haversine formula
  const R = 6371; // Earth's radius in kilometers
  const dLat = (destLat - currentLat) * Math.PI / 180;
  const dLng = (destLng - currentLng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(currentLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  // Calculate ETA in minutes
  const etaMinutes = (distance / avgSpeedKmh) * 60;
  
  return Math.round(etaMinutes);
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: string,
  latitude?: number,
  longitude?: number
): Promise<void> {
  try {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (latitude && longitude) {
      updateData.currentLatitude = latitude.toString();
      updateData.currentLongitude = longitude.toString();
    }

    // Set timestamps based on status
    if (status === 'picked_up') {
      updateData.actualPickupTime = new Date();
    } else if (status === 'delivered') {
      updateData.actualDeliveryTime = new Date();
    }

    await db
      .update(deliveryTracking)
      .set(updateData)
      .where(eq(deliveryTracking.id, deliveryId));

    // Get order ID for WebSocket update
    const [delivery] = await db
      .select({ orderId: deliveryTracking.orderId })
      .from(deliveryTracking)
      .where(eq(deliveryTracking.id, deliveryId))
      .limit(1);

    if (delivery) {
      await sendTrackingUpdate(delivery.orderId);
    }

  } catch (error) {
    console.error('Error updating delivery status:', error);
    throw error;
  }
}