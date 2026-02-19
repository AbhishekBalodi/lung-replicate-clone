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
       🔹 HEADER-BASED TENANT RESOLUTION (works everywhere)
       Checked FIRST — allows SaaS platform (on any domain)
       to override domain-based resolution via X-Tenant-Code header.
       Individual tenant websites don't send this header,
       so they fall through to domain-based resolution below.
       ============================================================ */
    const headerTenantCode =
      req.headers['x-tenant-code'] || req.query.tenantCode;

    if (headerTenantCode) {
      const dbName = LEGACY_DB_MAP[headerTenantCode] || headerTenantCode;

      try {
        const [tenants] = await platformPool.execute(
          'SELECT * FROM tenants WHERE tenant_code = ? AND status = ?',
          [headerTenantCode, 'active']
        );

        if (tenants.length > 0) {
          req.tenant = tenants[0];
          req.tenantPool = await getTenantPool(dbName);
        } else {
          // Legacy fallback (Doctor Mann before SaaS)
          req.tenant = {
            id: 0,
            tenant_code: headerTenantCode,
            name:
              headerTenantCode === 'doctor_mann'
                ? 'Dr. Mann Clinic'
                : headerTenantCode,
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
          tenant_code: headerTenantCode,
          name: headerTenantCode,
          type: 'doctor',
          status: 'active'
        };
        req.tenantPool = await getTenantPool(dbName);
      }

      return next();
    }

    /* ============================================================
       🌍 DOMAIN-BASED TENANT RESOLUTION (production fallback)
       Used by individual tenant websites on their own domains.
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

    // Skip domain resolution for localhost (no domain mapping)
    if (
      domain.includes('localhost') ||
      domain.includes('127.0.0.1')
    ) {
      return next();
    }

    const tenant = await resolveTenantFromDomain(domain);

    if (tenant) {
      req.tenant = tenant;

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
