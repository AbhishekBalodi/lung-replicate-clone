/**
 * API Helper with Tenant Support
 * 
 * In development, includes X-Tenant-Code header for tenant switching.
 * In production, tenant is resolved from domain.
 */

import { getDevTenantCode } from "@/components/DevTenantSwitcher";

const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || "";
};

/**
 * Get doctor context from localStorage (set after login)
 */
const getDoctorContext = (): { doctorId: string | null; userRole: string | null } => {
  try {
    const storedUser = localStorage.getItem('customUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return {
        doctorId: user.doctorId?.toString() || null,
        userRole: user.role || null,
      };
    }
  } catch (e) {
    // Ignore parse errors
  }
  return { doctorId: null, userRole: null };
};

export const getApiHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...additionalHeaders,
  };

  // Add tenant code header in development
  const tenantCode = getDevTenantCode();
  if (tenantCode) {
    headers["X-Tenant-Code"] = tenantCode;
  }

  // Add doctor context headers
  const { doctorId, userRole } = getDoctorContext();
  if (doctorId) {
    headers["X-Doctor-Id"] = doctorId;
  }
  if (userRole) {
    headers["X-User-Role"] = userRole;
  }

  return headers;
};

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${getApiBaseUrl()}${endpoint}`;
  
  const headers = getApiHeaders(
    options.headers as Record<string, string> || {}
  );

  // In development (with Vite proxy), requests go to same origin
  // In production, we need credentials: 'include' for cross-origin cookies
  const isDev = import.meta.env.DEV;
  
  return fetch(url, {
    ...options,
    headers,
    // Only include credentials for cross-origin in production
    credentials: isDev ? 'same-origin' : 'include',
  });
};

export const apiGet = async (endpoint: string) => {
  return apiFetch(endpoint, { method: "GET" });
};

export const apiPost = async (endpoint: string, body: unknown) => {
  return apiFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const apiPut = async (endpoint: string, body: unknown) => {
  return apiFetch(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

export const apiDelete = async (endpoint: string) => {
  return apiFetch(endpoint, { method: "DELETE" });
};

export default {
  getApiBaseUrl,
  getApiHeaders,
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
};
