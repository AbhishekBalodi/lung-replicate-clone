import { resolveTenantFromDomain, getTenantPool, platformPool } from '../lib/platform-db.js';

/**
 * Middleware to resolve tenant from request domain
 * Sets req.tenant and req.tenantPool if resolved
 */
export async function tenantResolver(req, res, next) {
  try {
    // Skip tenant resolution for platform routes
    if (req.path.startsWith('/api/platform/') || req.path.startsWith('/api/tenants')) {
      return next();
    }

    // Get domain from request
    const domain = req.hostname || req.headers.host;
    
    // Skip for localhost/development
    if (domain.includes('localhost') || domain.includes('127.0.0.1')) {
      // In development, check for X-Tenant-Code header or query param
      const tenantCode = req.headers['x-tenant-code'] || req.query.tenantCode;
      
      if (tenantCode) {
        const [tenants] = await platformPool.execute(
          'SELECT * FROM tenants WHERE tenant_code = ? AND status = ?',
          [tenantCode, 'active']
        );

        if (tenants.length > 0) {
          req.tenant = tenants[0];
          req.tenantPool = await getTenantPool(tenantCode);
        }
      }
      
      return next();
    }

    // Resolve tenant from domain
    const tenant = await resolveTenantFromDomain(domain);

    if (tenant) {
      req.tenant = tenant;
      req.tenantPool = await getTenantPool(tenant.tenant_code);
    }

    next();
  } catch (error) {
    console.error('Tenant resolution error:', error);
    next(); // Continue without tenant
  }
}

/**
 * Middleware to require a resolved tenant
 */
export function requireTenant(req, res, next) {
  if (!req.tenant || !req.tenantPool) {
    return res.status(404).json({ 
      error: 'Tenant not found',
      message: 'This domain is not registered with our platform'
    });
  }
  next();
}

/**
 * Middleware to require specific tenant user roles
 */
export function requireTenantRole(...roles) {
  return (req, res, next) => {
    if (!req.tenantUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.tenantUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

/**
 * Get tenant settings
 */
export async function getTenantSettings(tenantId) {
  const [settings] = await platformPool.execute(
    'SELECT * FROM tenant_settings WHERE tenant_id = ?',
    [tenantId]
  );
  return settings[0] || null;
}
