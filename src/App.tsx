import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NewPlan from "./pages/NewPlan";
import PlanView from "./pages/PlanView";
import PlanLocked from "./pages/PlanLocked";
import PlanManage from "./pages/PlanManage";
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import NotFound from "./pages/NotFound";
import { analytics } from "./lib/analytics";

const queryClient = new QueryClient();

// Share redirect component
const ShareRedirect = () => {
  const { planId } = useParams();
  
  useEffect(() => {
    // Initialize analytics
    analytics.init();
  }, []);
  
  if (!planId) {
    return <Navigate to="/" replace />;
  }
  
  // Redirect to plan view with sharecard source
  window.location.href = `/p/${planId}?src=sc`;
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    analytics.init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NewPlan />} />
          <Route path="/new" element={<NewPlan />} />
          <Route path="/p/:planId" element={<PlanView />} />
          <Route path="/p/:planId/locked" element={<PlanLocked />} />
          <Route path="/p/:planId/manage" element={<PlanManage />} />
          <Route path="/s/:planId" element={<ShareRedirect />} />
          <Route path="/legal/privacy" element={<Privacy />} />
          <Route path="/legal/terms" element={<Terms />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
