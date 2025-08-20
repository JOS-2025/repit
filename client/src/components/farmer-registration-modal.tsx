import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FarmerRegistrationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FarmerRegistrationModal({ open, onClose }: FarmerRegistrationModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    farmName: "",
    location: "",
    farmSize: "",
    description: "",
  });

  const registerFarmerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/farmers", {
        ...data,
        farmSize: data.farmSize ? parseFloat(data.farmSize) : null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Farmer registration completed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
      setFormData({
        farmName: "",
        location: "",
        farmSize: "",
        description: "",
      });
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
        description: "Failed to register as farmer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerFarmerMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Join as a Farmer Partner
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="farmerName">Farmer Name</Label>
              <Input
                id="farmerName"
                value={user?.firstName || ""}
                disabled
                className="bg-gray-50"
                data-testid="input-farmer-name"
              />
              <p className="text-xs text-gray-500 mt-1">From your profile</p>
            </div>
            
            <div>
              <Label htmlFor="farmName">Farm Name *</Label>
              <Input
                id="farmName"
                value={formData.farmName}
                onChange={(e) => handleInputChange('farmName', e.target.value)}
                placeholder="Green Valley Farm"
                required
                data-testid="input-farm-name"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="location">Farm Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Nairobi, Kenya"
                required
                data-testid="input-location"
              />
            </div>
            
            <div>
              <Label htmlFor="farmSize">Farm Size (acres)</Label>
              <Input
                id="farmSize"
                type="number"
                step="0.1"
                value={formData.farmSize}
                onChange={(e) => handleInputChange('farmSize', e.target.value)}
                placeholder="5.5"
                data-testid="input-farm-size"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-50"
                data-testid="input-email"
              />
              <p className="text-xs text-gray-500 mt-1">From your profile</p>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="description">Farm Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell customers about your farm and farming practices..."
                rows={3}
                data-testid="textarea-description"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={registerFarmerMutation.isPending}
              className="flex-1 bg-farm-green hover:bg-farm-green-dark"
              data-testid="button-register"
            >
              {registerFarmerMutation.isPending ? "Registering..." : "Register as Farmer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
