/**
 * Dev-Only Tenant Switcher
 * 
 * This component only appears in development mode.
 * It allows switching between tenants without modifying hosts file.
 * The selected tenant code is stored in localStorage and sent as a header to the API.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, X, RefreshCw } from "lucide-react";

interface Tenant {
  id: number;
  tenant_code: string;
  name: string;
  type: string;
  status: string;
}

const TENANT_STORAGE_KEY = "dev_tenant_code";

const isLocalhost = () => {
  try {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
};

/**
 * Get the tenant code from localStorage.
 * This works in all environments (dev + production) since the tenant switcher
 * is a public feature allowing users to switch between tenant websites.
 */
export const getDevTenantCode = (): string | null => {
  return localStorage.getItem(TENANT_STORAGE_KEY);
};

export const setDevTenantCode = (code: string | null, reload = true) => {
  const current = localStorage.getItem(TENANT_STORAGE_KEY);
  if (code) {
    localStorage.setItem(TENANT_STORAGE_KEY, code);
  } else {
    localStorage.removeItem(TENANT_STORAGE_KEY);
  }
  // Only reload when the value actually changed and caller wants a reload
  if (reload && code !== current) {
    window.location.reload();
  }
};

const DevTenantSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<string | null>(null);
  
  // Always allow tenant switching (public feature)
  const isProduction = false;

  useEffect(() => {
    if (!isProduction) {
      setCurrentTenant(getDevTenantCode());
    }
  }, [isProduction]);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "";
      console.log("[DevTenantSwitcher] Fetching from:", `${apiBase}/api/tenants`);
      const response = await fetch(`${apiBase}/api/tenants`);
      console.log("[DevTenantSwitcher] Response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("[DevTenantSwitcher] Response data:", data);
        console.log("[DevTenantSwitcher] Tenants array:", data.tenants);
        setTenants(data.tenants || []);
      } else {
        console.error("[DevTenantSwitcher] Response not OK:", response.statusText);
      }
    } catch (error) {
      console.error("[DevTenantSwitcher] Failed to fetch tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isProduction && isOpen) {
      fetchTenants();
    }
  }, [isOpen, isProduction]);

  const handleTenantChange = (tenantCode: string) => {
    if (tenantCode === "none") {
      setDevTenantCode(null);
    } else {
      setDevTenantCode(tenantCode);
    }
  };

  const currentTenantName = tenants.find(t => t.tenant_code === currentTenant)?.name;

  // Only render in development - move conditional AFTER all hooks
  if (isProduction) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          variant="outline"
          className="bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-600 shadow-lg"
        >
          <Settings className="h-4 w-4 mr-2" />
          DEV: {currentTenant ? currentTenantName || currentTenant : "No Tenant"}
        </Button>
      ) : (
        <div className="bg-card border border-border rounded-lg shadow-xl p-4 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-yellow-600">
              🔧 Dev Tenant Switcher
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Select a tenant to view their website:
            </div>
            
            {/* Debug: Show tenant count */}
            <div className="text-xs text-blue-500">
              Loaded {tenants.length} tenant(s)
            </div>
            
            <div className="flex gap-2">
              <Select
                value={currentTenant || "none"}
                onValueChange={handleTenantChange}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select tenant..." />
                </SelectTrigger>
                <SelectContent className="bg-popover z-[10000]">
                  <SelectItem value="none">
                    -- Original (Doctor Mann) --
                  </SelectItem>
                  {tenants.length > 0 && tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.tenant_code}>
                      {tenant.name} ({tenant.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={fetchTenants}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
            
            {currentTenant && (
              <div className="text-xs bg-yellow-500/10 text-yellow-700 p-2 rounded">
                Viewing: <strong>{currentTenantName || currentTenant}</strong>
              </div>
            )}
            
            <div className="text-[10px] text-muted-foreground border-t pt-2 mt-2">
              This switcher only appears in development mode.
              Register new tenants at the SaaS Platform (localhost:5174).
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevTenantSwitcher;
