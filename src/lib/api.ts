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

  return fetch(url, {
    ...options,
    headers,
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
