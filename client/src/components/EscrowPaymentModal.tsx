import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, CreditCard, DollarSign, Shield, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EscrowPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    farmerId: string;
    farmerName: string;
    totalAmount: number;
    products: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
}

export function EscrowPaymentModal({ isOpen, onClose, orderData }: EscrowPaymentModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentStep, setCurrentStep] = useState<"select" | "processing" | "confirm" | "completed">("select");
  const [escrowTransactionId, setEscrowTransactionId] = useState<string>("");
  const { toast } = useToast();

  // Initialize escrow payment
  const initiateMutation = useMutation({
    mutationFn: async (paymentData: any) => 
      apiRequest("POST", "/api/escrow/initiate", paymentData),
    onSuccess: (data: any) => {
      setEscrowTransactionId(data.escrowTransactionId);
      setCurrentStep("processing");
      toast({
        title: "Payment Initiated",
        description: "Check your phone for payment prompt",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Confirm payment
  const confirmMutation = useMutation({
    mutationFn: async (confirmData: { transactionId: string; paymentProof?: string }) =>
      apiRequest("POST", "/api/escrow/confirm-payment", confirmData),
    onSuccess: () => {
      setCurrentStep("completed");
      toast({
        title: "Payment Confirmed",
        description: "Funds are now held securely in escrow",
      });
    },
    onError: (error) => {
      toast({
        title: "Confirmation Failed",
        description: "Failed to confirm payment. Please contact support.",
        variant: "destructive",
      });
    },
  });

  // Get transaction status
  const { data: transactionStatus } = useQuery({
    queryKey: ['/api/escrow/status', escrowTransactionId],
    enabled: !!escrowTransactionId,
    refetchInterval: currentStep === "processing" ? 5000 : false, // Poll every 5 seconds during processing
  });

  const handleInitiatePayment = () => {
    if (!selectedProvider || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please select payment provider and enter phone number",
        variant: "destructive",
      });
      return;
    }

    initiateMutation.mutate({
      orderId: orderData.orderId,
      farmerId: orderData.farmerId,
      amount: orderData.totalAmount,
      provider: selectedProvider,
      phoneNumber: phoneNumber,
    });
  };

  const handleConfirmPayment = () => {
    confirmMutation.mutate({
      transactionId: escrowTransactionId,
    });
  };

  const paymentProviders = [
    { value: "mpesa", label: "M-Pesa", icon: "📱" },
    { value: "airtel_money", label: "Airtel Money", icon: "📲" },
    { value: "tigopesa", label: "Tigo Pesa", icon: "💳" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Secure Escrow Payment
          </CardTitle>
          <CardDescription>
            Your money is safely held until delivery is confirmed
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="space-y-3">
            <h4 className="font-medium">Order Summary</h4>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Farmer:</span>
                <span className="text-sm font-medium">{orderData.farmerName}</span>
              </div>
              <div className="space-y-1">
                {orderData.products.map((product, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{product.name} x {product.quantity}</span>
                    <span>KSh {(product.price * product.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Amount:</span>
                <span className="text-green-600">KSh {orderData.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Steps */}
          {currentStep === "select" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Payment Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger data-testid="select-payment-provider">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentProviders.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div className="flex items-center gap-2">
                          <span>{provider.icon}</span>
                          {provider.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="07xxxxxxxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  data-testid="input-phone-number"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleInitiatePayment}
                  disabled={initiateMutation.isPending}
                  className="flex-1"
                  data-testid="button-initiate-payment"
                >
                  {initiateMutation.isPending ? "Processing..." : "Pay Now"}
                </Button>
              </div>
            </div>
          )}

          {currentStep === "processing" && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center">
                <Clock className="h-8 w-8 text-orange-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Payment in Progress</h4>
                <p className="text-sm text-gray-600">
                  Check your phone for the payment prompt from {selectedProvider === "mpesa" ? "M-Pesa" : selectedProvider === "airtel_money" ? "Airtel Money" : "Tigo Pesa"}
                </p>
                <Badge variant="outline" className="text-xs">
                  Transaction ID: {escrowTransactionId.slice(0, 8)}...
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                  data-testid="button-close"
                >
                  Close
                </Button>
                <Button 
                  onClick={handleConfirmPayment}
                  disabled={confirmMutation.isPending}
                  className="flex-1"
                  data-testid="button-confirm-payment"
                >
                  {confirmMutation.isPending ? "Confirming..." : "I've Paid"}
                </Button>
              </div>
            </div>
          )}

          {currentStep === "completed" && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">Payment Secured!</h4>
                <p className="text-sm text-gray-600">
                  Your funds are safely held in escrow and will be released to the farmer once delivery is confirmed.
                </p>
                <Badge variant="secondary" className="text-xs">
                  Escrow Protection Active
                </Badge>
              </div>
              
              <Button 
                onClick={onClose}
                className="w-full"
                data-testid="button-complete"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Security Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-1" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-blue-800">Escrow Protection</p>
                <p className="text-xs text-blue-700">
                  Your money is held securely until you confirm receipt of your order. 
                  If there are any issues, you can request a full refund.
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Status */}
          {(transactionStatus as any)?.transaction && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Transaction Status</Label>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    (transactionStatus as any).transaction.status === "held" ? "default" :
                    (transactionStatus as any).transaction.status === "pending" ? "secondary" :
                    (transactionStatus as any).transaction.status === "released" ? "default" :
                    "destructive"
                  }
                >
                  {(transactionStatus as any).transaction.status}
                </Badge>
                <span className="text-xs text-gray-500">
                  {(transactionStatus as any).transaction.provider.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}