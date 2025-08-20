import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import ProductUpload from "@/components/product-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import FarmerRegistrationModal from "@/components/farmer-registration-modal";

export default function FarmerDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [showRegistration, setShowRegistration] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    unit: "",
    availableQuantity: "",
    harvestDate: "",
  });
  const [productImages, setProductImages] = useState<File[]>([]);

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

  // Check if user is a farmer, if not show registration modal
  useEffect(() => {
    if (user && !user.farmer) {
      setShowRegistration(true);
    }
  }, [user]);

  const { data: farmerProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/farmers", user?.farmer?.id, "products"],
    enabled: !!user?.farmer?.id,
    retry: false,
  });

  const { data: farmerOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders/farmer"],
    enabled: !!user?.farmer,
    retry: false,
  });

  const createProductMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("POST", "/api/products", formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product added successfully!",
      });
      setProductForm({
        name: "",
        description: "",
        category: "",
        price: "",
        unit: "",
        availableQuantity: "",
        harvestDate: "",
      });
      setProductImages([]);
      queryClient.invalidateQueries({ queryKey: ["/api/farmers", user?.farmer?.id, "products"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      return apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success", 
        description: "Order status updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/farmer"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    Object.entries(productForm).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    
    productImages.forEach((file) => {
      formData.append('images', file);
    });
    
    createProductMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-seedling text-farm-green text-4xl mb-4 animate-pulse"></i>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user?.farmer && !showRegistration) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <i className="fas fa-user-check text-4xl text-farm-green mb-4"></i>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Farmer Registration Required</h1>
              <p className="text-gray-600 mb-4">
                You need to complete farmer registration to access the dashboard.
              </p>
              <Button 
                onClick={() => setShowRegistration(true)}
                className="bg-farm-green hover:bg-farm-green-dark"
                data-testid="button-register-farmer"
              >
                Register as Farmer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const totalEarnings = farmerOrders.reduce((sum: number, order: any) => 
    sum + parseFloat(order.totalAmount || 0), 0
  );
  const activeProducts = farmerProducts.filter((product: any) => product.isActive).length;
  const newOrders = farmerOrders.filter((order: any) => 
    order.status === 'pending' || order.status === 'confirmed'
  ).length;

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="text-farm-name">
              {user?.farmer?.farmName} Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.firstName || user?.farmer?.farmName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user?.farmer?.isVerified && (
              <Badge className="bg-green-100 text-green-800" data-testid="badge-verified">
                <i className="fas fa-check-circle mr-1"></i>
                Verified Farmer
              </Badge>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-total-earnings">
                    KSh {totalEarnings.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <i className="fas fa-coins text-green-600"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Products</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-active-products">
                    {activeProducts}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <i className="fas fa-boxes text-blue-600"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Orders</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-new-orders">
                    {newOrders}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <i className="fas fa-shopping-bag text-orange-600"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-lg font-bold text-gray-900" data-testid="text-farm-location">
                    {user?.farmer?.location}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <i className="fas fa-map-marker-alt text-yellow-600"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Organic Tomatoes"
                  required
                  data-testid="input-product-name"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => handleInputChange('category', value)} required>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="grains">Grains</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="herbs">Herbs</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Price per Unit (KSh)</Label>
                <Input
                  id="price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="120"
                  required
                  data-testid="input-price"
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit Type</Label>
                <Select onValueChange={(value) => handleInputChange('unit', value)} required>
                  <SelectTrigger data-testid="select-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="piece">piece</SelectItem>
                    <SelectItem value="bunch">bunch</SelectItem>
                    <SelectItem value="bag">bag</SelectItem>
                    <SelectItem value="liter">liter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Available Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={productForm.availableQuantity}
                  onChange={(e) => handleInputChange('availableQuantity', e.target.value)}
                  placeholder="50"
                  required
                  data-testid="input-quantity"
                />
              </div>

              <div>
                <Label htmlFor="harvestDate">Harvest Date</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={productForm.harvestDate}
                  onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                  data-testid="input-harvest-date"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Product Images</Label>
                <FileUpload
                  files={productImages}
                  onFilesChange={setProductImages}
                  accept="image/*"
                  maxFiles={5}
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Product Description</Label>
                <Textarea
                  id="description"
                  value={productForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your product, farming methods, certifications..."
                  rows={3}
                  data-testid="textarea-description"
                />
              </div>

              <div className="md:col-span-2">
                <Button 
                  type="submit" 
                  className="w-full bg-farm-green hover:bg-farm-green-dark"
                  disabled={createProductMutation.isPending}
                  data-testid="button-add-product"
                >
                  {createProductMutation.isPending ? "Adding Product..." : "Add Product to Store"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">Loading orders...</p>
              </div>
            ) : farmerOrders.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-shopping-bag text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {farmerOrders.slice(0, 10).map((order: any) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900" data-testid={`text-order-id-${order.id}`}>
                          #{order.id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900" data-testid={`text-customer-${order.id}`}>
                          {order.customer?.firstName} {order.customer?.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900" data-testid={`text-amount-${order.id}`}>
                          KSh {parseFloat(order.totalAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant={order.status === 'delivered' ? 'default' : 'secondary'}
                            data-testid={`badge-status-${order.id}`}
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Select onValueChange={(status) => 
                            updateOrderStatusMutation.mutate({ orderId: order.id, status })
                          }>
                            <SelectTrigger className="w-32" data-testid={`select-status-${order.id}`}>
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="harvested">Harvested</SelectItem>
                              <SelectItem value="in_transit">In Transit</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <FarmerRegistrationModal 
        open={showRegistration}
        onClose={() => setShowRegistration(false)}
      />
    </div>
  );
}
