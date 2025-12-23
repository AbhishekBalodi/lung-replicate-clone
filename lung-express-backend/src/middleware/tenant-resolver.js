import {
  resolveTenantFromDomain,
  getTenantPool,
  platformPool
} from '../lib/platform-db.js';

// Legacy database name mapping - tenant_code -> actual database name
// This handles cases where database names don't match tenant codes
const LEGACY_DB_MAP = {
  doctor_mann: 'Doctor_Mann' // Original system before SaaS
};

/**
 * Middleware to resolve tenant from request domain
 * Sets req.tenant and req.tenantPool if resolved
 *
 * Platform data (tenants, tenant_users) lives in `saas_platform`
 * Each tenant's operational data lives in its own schema
 */
export async function tenantResolver(req, res, next) {
  try {
    /* ============================================================
       🚫 Skip tenant resolution for PLATFORM routes
       ============================================================ */
    if (
      req.path.startsWith('/api/platform/') ||
      req.path.startsWith('/api/tenants')
    ) {
      return next();
    }

    /* ============================================================
       🔹 Resolve domain
       ============================================================ */
    let domain = req.hostname || req.headers.host;

    // Normalize domain (remove port if any)
    if (domain && domain.includes(':')) {
      domain = domain.split(':')[0];
    }

    // Normalize www
    if (domain && domain.startsWith('www.')) {
      domain = domain.slice(4);
    }

    /* ============================================================
       🧪 LOCAL DEVELOPMENT (localhost)
       ============================================================ */
    if (
      domain.includes('localhost') ||
      domain.includes('127.0.0.1')
    ) {
      const tenantCode =
        req.headers['x-tenant-code'] || req.query.tenantCode;

      if (tenantCode) {
        const dbName =
          LEGACY_DB_MAP[tenantCode] || tenantCode;

        try {
          // Query PLATFORM DB for tenant metadata
          const [tenants] = await platformPool.execute(
            'SELECT * FROM tenants WHERE tenant_code = ? AND status = ?',
            [tenantCode, 'active']
          );

          if (tenants.length > 0) {
            req.tenant = tenants[0];
            req.tenantPool = await getTenantPool(dbName);
          } else {
            // Legacy fallback (Doctor Mann before SaaS)
            req.tenant = {
              id: 0,
              tenant_code: tenantCode,
              name:
                tenantCode === 'doctor_mann'
                  ? 'Dr. Mann Clinic'
                  : tenantCode,
              type: 'doctor',
              status: 'active'
            };
            req.tenantPool = await getTenantPool(dbName);
          }
        } catch (err) {
          console.error(
            '⚠ Platform DB lookup failed, using legacy fallback:',
            err.message
          );
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

    /* ============================================================
       🌍 PRODUCTION (DOMAIN-BASED TENANT RESOLUTION)
       ============================================================ */

    const tenant = await resolveTenantFromDomain(domain);

    if (tenant) {
      req.tenant = tenant;

      // 🔥 CRITICAL FIX: Apply legacy DB mapping here too
      const dbName =
        LEGACY_DB_MAP[tenant.tenant_code] ||
        tenant.tenant_code;

      req.tenantPool = await getTenantPool(dbName);
    }

    return next();
  } catch (error) {
    console.error('❌ Tenant resolution error:', error);
    return next();
  }
}

/* ============================================================
   🔐 Require tenant middleware
   ============================================================ */
export function requireTenant(req, res, next) {
  if (!req.tenant || !req.tenantPool) {
    return res.status(404).json({
      error: 'Tenant not found',
      message: 'This domain is not registered with our platform'
    });
  }
  next();
}

/* ============================================================
   🔐 Require tenant role middleware
   ============================================================ */
export function requireTenantRole(...roles) {
  return (req, res, next) => {
    if (!req.tenantUser) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.tenantUser.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions'
      });
    }

    next();
  };
}

/* ============================================================
   ⚙ Tenant settings helper
   ============================================================ */
export async function getTenantSettings(tenantId) {
  const [settings] = await platformPool.execute(
    'SELECT * FROM tenant_settings WHERE tenant_id = ?',
    [tenantId]
  );
  return settings[0] || null;
}
