import { resolveTenantFromDomain, getTenantPool, platformPool } from '../lib/platform-db.js';

// Legacy database name mapping - tenant_code -> actual database name
// This handles cases where database names don't match tenant codes
const LEGACY_DB_MAP = {
  'doctor_mann': 'Doctor_Mann'  // Original system before SaaS
};

/**
 * Middleware to resolve tenant from request domain
 * Sets req.tenant and req.tenantPool if resolved
 * 
 * IMPORTANT: Platform data (tenants, tenant_users) is in the `saas_platform` database.
 * Each tenant's operational data (appointments, patients) is in their own schema (e.g., `dr_dr_gaurav_taneja`).
 * 
 * LEGACY SUPPORT: For Doctor Mann (the original system before SaaS), we use the `Doctor_Mann` database directly.
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
        // Check if this is a legacy tenant with a mapped database name
        const dbName = LEGACY_DB_MAP[tenantCode] || tenantCode;
        
        try {
          // CRITICAL: Query the platform database for tenant info, not the tenant schema
          const [tenants] = await platformPool.execute(
            'SELECT * FROM tenants WHERE tenant_code = ? AND status = ?',
            [tenantCode, 'active']
          );

          if (tenants.length > 0) {
            req.tenant = tenants[0];
            // Get or create a pool for the tenant's own schema using mapped DB name
            req.tenantPool = await getTenantPool(dbName);
          } else {
            // Legacy fallback: tenant might not be in platform DB yet
            req.tenant = {
              id: 0,
              tenant_code: tenantCode,
              name: tenantCode === 'doctor_mann' ? 'Dr. Mann Clinic' : tenantCode,
              type: 'doctor',
              status: 'active'
            };
            req.tenantPool = await getTenantPool(dbName);
          }
        } catch (dbError) {
          // If platform DB query fails, still try to connect to tenant DB directly
          console.error('Platform DB query failed:', dbError.message);
          req.tenant = {
            id: 0,
            tenant_code: tenantCode,
            name: tenantCode,
            type: 'doctor',
            status: 'active'
          };
          req.tenantPool = await getTenantPool(dbName);
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
