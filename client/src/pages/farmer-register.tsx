import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Footer from "@/components/footer";
import { Leaf, MapPin, Phone, Mail, FileText, CheckCircle, Upload } from "lucide-react";

const farmerRegistrationSchema = z.object({
  farmerName: z.string().min(2, "Farm name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter a complete address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  farmSize: z.string().min(1, "Please specify farm size"),
  farmType: z.string().min(1, "Please select farm type"),
  productsGrown: z.string().min(10, "Please describe the products you grow"),
  experience: z.string().min(1, "Please select your farming experience"),
  certifications: z.string().optional(),
  description: z.string().min(20, "Please provide a detailed description (min 20 characters)"),
});

type FarmerRegistrationForm = z.infer<typeof farmerRegistrationSchema>;

export default function FarmerRegister() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FarmerRegistrationForm>({
    resolver: zodResolver(farmerRegistrationSchema),
    defaultValues: {
      farmerName: "",
      ownerName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      farmSize: "",
      farmType: "",
      productsGrown: "",
      experience: "",
      certifications: "",
      description: "",
    },
  });

  const registerFarmerMutation = useMutation({
    mutationFn: async (data: FarmerRegistrationForm) => {
      return apiRequest("POST", "/api/farmers/register", data);
    },
    onSuccess: () => {
      toast({
        title: "Registration Submitted Successfully!",
        description: "Your farmer registration has been submitted for review. We'll contact you within 2-3 business days.",
      });
      setLocation("/farmer-dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FarmerRegistrationForm) => {
    registerFarmerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Farmer Partner</h1>
            <p className="text-lg text-gray-600">
              Join FramCart's network of verified farmers and connect directly with customers
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Direct Sales</h3>
                <p className="text-sm text-gray-600">Sell directly to customers without intermediaries</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Fair Pricing</h3>
                <p className="text-sm text-gray-600">Set your own prices and maximize profits</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Phone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">24/7 Support</h3>
                <p className="text-sm text-gray-600">Get help whenever you need it</p>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Farmer Registration Application</CardTitle>
              <CardDescription>
                Please fill out all fields below. All information will be verified before approval.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="farmerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Farm Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Green Valley Farm" {...field} data-testid="input-farm-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ownerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Owner Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John Smith" {...field} data-testid="input-owner-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="farmer@example.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="+254 700 000 000" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Farm Location */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Farm Location</h3>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Farm Road" {...field} data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nairobi" {...field} data-testid="input-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>County/State *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nairobi County" {...field} data-testid="input-state" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="00100" {...field} data-testid="input-zip" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Farm Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Farm Details</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="farmSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Farm Size *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-farm-size">
                                  <SelectValue placeholder="Select farm size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="small">Small (under 5 acres)</SelectItem>
                                <SelectItem value="medium">Medium (5-20 acres)</SelectItem>
                                <SelectItem value="large">Large (20-100 acres)</SelectItem>
                                <SelectItem value="enterprise">Enterprise (over 100 acres)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="farmType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Farm Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-farm-type">
                                  <SelectValue placeholder="Select farm type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="vegetables">Vegetables</SelectItem>
                                <SelectItem value="fruits">Fruits</SelectItem>
                                <SelectItem value="grains">Grains & Cereals</SelectItem>
                                <SelectItem value="dairy">Dairy</SelectItem>
                                <SelectItem value="poultry">Poultry</SelectItem>
                                <SelectItem value="mixed">Mixed Farming</SelectItem>
                                <SelectItem value="organic">Organic Farming</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farming Experience *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-experience">
                                <SelectValue placeholder="Select your farming experience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner (under 2 years)</SelectItem>
                              <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                              <SelectItem value="experienced">Experienced (5-10 years)</SelectItem>
                              <SelectItem value="expert">Expert (over 10 years)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="productsGrown"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Products You Grow *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the fruits, vegetables, or other products you grow..."
                              {...field}
                              data-testid="textarea-products"
                            />
                          </FormControl>
                          <FormDescription>
                            List the main products you grow and any seasonal variations.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="certifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certifications (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List any organic, fair trade, or other certifications..."
                              {...field}
                              data-testid="textarea-certifications"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell customers about your farm, farming practices, and what makes your products special..."
                              {...field}
                              data-testid="textarea-description"
                            />
                          </FormControl>
                          <FormDescription>
                            This description will be shown to customers on your farmer profile.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={registerFarmerMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-submit-registration"
                    >
                      {registerFarmerMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mt-8 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">What Happens Next?</h3>
              <div className="space-y-2 text-sm text-green-800">
                <p>✅ Your application will be reviewed within 2-3 business days</p>
                <p>✅ We'll verify your farm information and contact you for any additional details</p>
                <p>✅ Once approved, you'll get access to your farmer dashboard and can start listing products</p>
                <p>✅ Our team will help you set up your profile and get your first products listed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}