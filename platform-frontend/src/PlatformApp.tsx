/**
 * Platform App - SaaS Administration Application
 * 
 * This is a SEPARATE application from the tenant websites.
 * Deploy this at: admin.yourplatform.com (or similar)
 * 
 * Purpose:
 * - Tenant onboarding (hospitals & doctors registration)
 * - Platform admin dashboard (manage all tenants)
 * - Billing & subscription management
 * - Domain management for tenants
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Platform pages
import TenantOnboarding from "@/pages/platform/TenantOnboarding";
import PlatformLogin from "@/pages/platform/PlatformLogin";
import PlatformDashboard from "@/pages/platform/PlatformDashboard";

const queryClient = new QueryClient();

const PlatformApp = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Platform routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PlatformLogin />} />
          <Route path="/register" element={<TenantOnboarding />} />
          <Route path="/dashboard" element={<PlatformDashboard />} />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default PlatformApp;
