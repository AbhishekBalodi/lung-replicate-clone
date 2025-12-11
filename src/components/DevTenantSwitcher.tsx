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

export const getDevTenantCode = (): string | null => {
  if (import.meta.env.PROD) return null;
  return localStorage.getItem(TENANT_STORAGE_KEY);
};

export const setDevTenantCode = (code: string | null) => {
  if (code) {
    localStorage.setItem(TENANT_STORAGE_KEY, code);
  } else {
    localStorage.removeItem(TENANT_STORAGE_KEY);
  }
  // Reload to apply new tenant
  window.location.reload();
};

const DevTenantSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<string | null>(null);

  // Only render in development
  if (import.meta.env.PROD) return null;

  useEffect(() => {
    setCurrentTenant(getDevTenantCode());
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "";
      const response = await fetch(`${apiBase}/api/tenants`);
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      }
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTenants();
    }
  }, [isOpen]);

  const handleTenantChange = (tenantCode: string) => {
    if (tenantCode === "none") {
      setDevTenantCode(null);
    } else {
      setDevTenantCode(tenantCode);
    }
  };

  const currentTenantName = tenants.find(t => t.tenant_code === currentTenant)?.name;

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
            
            <div className="flex gap-2">
              <Select
                value={currentTenant || "none"}
                onValueChange={handleTenantChange}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select tenant..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">-- Original (Doctor Mann) --</span>
                  </SelectItem>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.tenant_code}>
                      <div className="flex items-center gap-2">
                        <span>{tenant.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({tenant.type})
                        </span>
                      </div>
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
