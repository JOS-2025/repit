import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/context/language-context";
import { PrivacyBanner, PrivacyStatusIndicator } from "@/components/PrivacyBanner";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import FarmerDashboard from "@/pages/farmer-dashboard";
import Products from "@/pages/products";
import OrderTracking from "@/pages/order-tracking";
import DriverDashboard from "@/pages/driver-dashboard";
import OrderTrackingLive from "@/pages/order-tracking-live";
import HelpCenter from "@/pages/help-center";
import TermsConditions from "@/pages/terms-conditions";
import PrivacyPolicy from "@/pages/privacy-policy";
import PrivacySettings from "@/pages/privacy-settings";
import WhatsAppSettings from "@/pages/whatsapp-settings";
import Checkout from "@/pages/checkout";
import FarmerAnalytics from "@/pages/farmer-analytics";
import Wishlist from "@/pages/wishlist";
import Community from "@/pages/community";
import AdminDashboard from "@/pages/admin";
import About from "@/pages/about";
import Categories from "@/pages/categories";
import Recommendations from "@/pages/recommendations";
import { EscrowDemo } from "@/pages/EscrowDemo";
import B2BIndex from "@/pages/b2b/index";
import BusinessRegister from "@/pages/b2b/register";
import BulkOrders from "@/pages/b2b/bulk-orders";
import ChatSupport from "@/components/chat-support";
import { lazy } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/products" component={Products} />
          <Route path="/categories" component={Categories} />
          <Route path="/recommendations" component={Recommendations} />
          <Route path="/farmer/:id" component={lazy(() => import("./pages/farmer-profile"))} />
          <Route path="/community" component={Community} />
          <Route path="/about" component={About} />
          <Route path="/help" component={HelpCenter} />
          <Route path="/terms" component={TermsConditions} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/privacy-settings" component={PrivacySettings} />
          <Route path="/escrow-demo" component={EscrowDemo} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/farmer-dashboard" component={FarmerDashboard} />
          <Route path="/products" component={Products} />
          <Route path="/categories" component={Categories} />
          <Route path="/recommendations" component={Recommendations} />
          <Route path="/farmer/:id" component={lazy(() => import("./pages/farmer-profile"))} />
          <Route path="/orders" component={OrderTracking} />
          <Route path="/driver-dashboard" component={DriverDashboard} />
          <Route path="/tracking" component={OrderTrackingLive} />
          <Route path="/help" component={HelpCenter} />
          <Route path="/terms" component={TermsConditions} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/privacy-settings" component={PrivacySettings} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/farmer-analytics" component={FarmerAnalytics} />
          <Route path="/wishlist" component={Wishlist} />
          <Route path="/community" component={Community} />
          <Route path="/about" component={About} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/escrow-demo" component={EscrowDemo} />
          <Route path="/b2b" component={B2BIndex} />
          <Route path="/b2b/register" component={BusinessRegister} />
          <Route path="/b2b/bulk-orders" component={BulkOrders} />
          <Route path="/whatsapp-settings" component={WhatsAppSettings} />
        </>
      )}
      
      {/* Global chat support - available on all pages when authenticated */}
      {isAuthenticated && <ChatSupport />}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          
          {/* Privacy and Anonymity Components */}
          <PrivacyBanner />
          <PrivacyStatusIndicator />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
