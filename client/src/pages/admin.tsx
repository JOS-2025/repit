import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Footer from "@/components/footer";
import {
  Shield,
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
  Settings,
  BarChart3,
  MapPin,
  Clock,
  Package
} from "lucide-react";

interface AdminDashboardData {
  totalFarmers: number;
  pendingFarmersCount: number;
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  activeUsers: number;
  recentOrders: any[];
  topProducts: any[];
  revenueByMonth: any[];
}

interface FarmerApplication {
  id: string;
  farmName: string;
  farmerName: string;
  location: string;
  farmSize: number;
  description: string;
  documents: string[];
  appliedAt: string;
  status: "pending" | "approved" | "rejected";
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Check if user is admin
  const { data: isAdmin, isLoading: checkingAdmin } = useQuery<boolean>({
    queryKey: ['/api/admin/check'],
    enabled: !!isAuthenticated,
    retry: false,
  });

  // Fetch admin dashboard data
  const { data: dashboardData, isLoading } = useQuery<AdminDashboardData>({
    queryKey: ['/api/admin/dashboard'],
    enabled: !!isAuthenticated && !!isAdmin,
    retry: false,
  });

  // Fetch pending farmer applications
  const { data: pendingApplications = [], isLoading: loadingApplications } = useQuery<FarmerApplication[]>({
    queryKey: ['/api/admin/farmer-applications'],
    enabled: !!isAuthenticated && !!isAdmin,
    retry: false,
  });

  // Approve farmer mutation
  const approveFarmerMutation = useMutation({
    mutationFn: async (farmerId: string) => {
      return apiRequest("PUT", `/api/admin/farmers/${farmerId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/farmer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      toast({
        title: "Farmer Approved",
        description: "Farmer has been successfully verified.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to approve farmer.",
        variant: "destructive",
      });
    },
  });

  // Reject farmer mutation
  const rejectFarmerMutation = useMutation({
    mutationFn: async (farmerId: string) => {
      return apiRequest("PUT", `/api/admin/farmers/${farmerId}/reject`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/farmer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      toast({
        title: "Application Rejected",
        description: "Farmer application has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reject application.",
        variant: "destructive",
      });
    },
  });

  // Suspend farmer mutation
  const suspendFarmerMutation = useMutation({
    mutationFn: async (farmerId: string) => {
      return apiRequest("PUT", `/api/admin/farmers/${farmerId}/suspend`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/farmers'] });
      toast({
        title: "Farmer Suspended",
        description: "Farmer has been suspended.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to suspend farmer.",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access the admin dashboard</p>
            <Button onClick={() => window.location.href = "/api/login"}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have admin privileges</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              FramCart Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {(user as any)?.firstName || 'Admin'}</span>
              <Badge className="bg-blue-100 text-blue-800">Admin</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="farmers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Farmers
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Farmers</p>
                      <p className="text-2xl font-bold">{dashboardData?.totalFarmers || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {dashboardData?.pendingFarmersCount || 0} pending approval
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold">{dashboardData?.totalOrders || 0}</p>
                    </div>
                    <Package className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">All time orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(dashboardData?.totalRevenue || 0)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-yellow-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Platform revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                      <p className="text-2xl font-bold">{formatCurrency(dashboardData?.totalCommission || 0)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Platform earnings</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.recentOrders?.slice(0, 5).map((order, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">Order #{order.id?.slice(-6)}</p>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                          <Badge className={`text-xs ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-4">No recent orders</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Pending Farmer Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingApplications.slice(0, 5).map((application) => (
                      <div key={application.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{application.farmName}</p>
                          <p className="text-sm text-gray-600">{application.location}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveFarmerMutation.mutate(application.id)}
                            disabled={approveFarmerMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectFarmerMutation.mutate(application.id)}
                            disabled={rejectFarmerMutation.isPending}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingApplications.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No pending applications</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="farmers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Farmer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingApplications ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingApplications.map((application) => (
                        <Card key={application.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{application.farmName}</h4>
                                <p className="text-gray-600">{application.farmerName}</p>
                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                  <p className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {application.location}
                                  </p>
                                  <p>Farm Size: {application.farmSize} acres</p>
                                  <p className="mt-2">{application.description}</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                <Button
                                  onClick={() => approveFarmerMutation.mutate(application.id)}
                                  disabled={approveFarmerMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                  data-testid={`button-approve-farmer-${application.id}`}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => rejectFarmerMutation.mutate(application.id)}
                                  disabled={rejectFarmerMutation.isPending}
                                  data-testid={`button-reject-farmer-${application.id}`}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  data-testid={`button-view-farmer-${application.id}`}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {pendingApplications.length === 0 && (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-600">No pending farmer applications</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Order management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commission Rate (%)
                    </label>
                    <Input type="number" defaultValue="5" className="w-32" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Amount
                    </label>
                    <Input type="number" defaultValue="500" className="w-32" />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}