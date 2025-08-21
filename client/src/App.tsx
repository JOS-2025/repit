import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/context/language-context";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import FarmerDashboard from "@/pages/farmer-dashboard";
import Products from "@/pages/products";
import OrderTracking from "@/pages/order-tracking";
import HelpCenter from "@/pages/help-center";
import TermsConditions from "@/pages/terms-conditions";
import PrivacyPolicy from "@/pages/privacy-policy";
import Checkout from "@/pages/checkout";
import FarmerAnalytics from "@/pages/farmer-analytics";
import Wishlist from "@/pages/wishlist";
import Community from "@/pages/community";
import ChatSupport from "@/components/chat-support";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/help" component={HelpCenter} />
          <Route path="/terms" component={TermsConditions} />
          <Route path="/privacy" component={PrivacyPolicy} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/farmer-dashboard" component={FarmerDashboard} />
          <Route path="/products" component={Products} />
          <Route path="/orders" component={OrderTracking} />
          <Route path="/driver-dashboard" component={() => import("@/pages/driver-dashboard").then(m => ({ default: m.default }))} />
          <Route path="/tracking" component={() => import("@/pages/order-tracking-live").then(m => ({ default: m.default }))} />
          <Route path="/help" component={HelpCenter} />
          <Route path="/terms" component={TermsConditions} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/farmer-analytics" component={FarmerAnalytics} />
          <Route path="/wishlist" component={Wishlist} />
          <Route path="/community" component={Community} />
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
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
