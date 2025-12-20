import mysql from 'mysql2/promise';

// Platform database name - configurable via env, defaults to saas_platform
const PLATFORM_DB = process.env.PLATFORM_DB_NAME || 'saas_platform';

// Platform database pool - for SaaS management (tenants, users, domains, settings)
// This is SEPARATE from tenant databases
export const platformPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: PLATFORM_DB,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

// Cache for tenant database pools
const tenantPools = new Map();

/**
 * Get or create a database pool for a specific tenant
 * @param {string} tenantCode - The tenant's database schema name
 * @returns {Promise<mysql.Pool>}
 */
export async function getTenantPool(tenantCode) {
  if (tenantPools.has(tenantCode)) {
    return tenantPools.get(tenantCode);
  }

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: tenantCode,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  tenantPools.set(tenantCode, pool);
  return pool;
}

/**
 * Resolve tenant from domain
 * @param {string} domain - The request hostname
 * @returns {Promise<Object|null>} - Tenant object or null
 */
export async function resolveTenantFromDomain(domain) {
  try {
    // Remove port if present
    const cleanDomain = domain.split(':')[0];
    
    const [rows] = await platformPool.execute(
      `SELECT t.*, td.domain, td.is_primary 
       FROM tenants t 
       JOIN tenant_domains td ON t.id = td.tenant_id 
       WHERE td.domain = ? AND td.verification_status = 'verified' AND t.status = 'active'`,
      [cleanDomain]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error('Error resolving tenant:', error);
    return null;
  }
}

/**
 * Create a new tenant database schema
 * @param {string} tenantCode - The tenant code for schema naming
 * @returns {Promise<boolean>}
 */
export async function createTenantSchema(tenantCode) {
  const connection = await platformPool.getConnection();
  
  try {
    // Read the template and replace placeholder
    const fs = await import('fs');
    const path = await import('path');
    const templatePath = path.join(process.cwd(), 'tenant_schema_template.sql');
    let template = fs.readFileSync(templatePath, 'utf8');
    template = template.replace(/\{\{TENANT_CODE\}\}/g, tenantCode);

    // Split by semicolon and execute each statement
    const statements = template.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    return true;
  } catch (error) {
    console.error('Error creating tenant schema:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Generate a unique tenant code from name
 * @param {string} name - Tenant name
 * @param {string} type - 'hospital' or 'doctor'
 * @returns {Promise<string>}
 */
export async function generateTenantCode(name, type) {
  const prefix = type === 'hospital' ? 'hosp' : 'dr';
  const base = name.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 20);
  
  let code = `${prefix}_${base}`;
  let counter = 1;

  // Check for uniqueness
  while (true) {
    const [rows] = await platformPool.execute(
      'SELECT id FROM tenants WHERE tenant_code = ?',
      [code]
    );
    
    if (rows.length === 0) {
      return code;
    }
    
    code = `${prefix}_${base}_${counter}`;
    counter++;
  }
}

/**
 * Generate domain verification token
 * @returns {string}
 */
export function generateVerificationToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'saas_verify_';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Verify platform pool on startup
(async () => {
  try {
    const conn = await platformPool.getConnection();
    await conn.ping();
    conn.release();
    console.log(`Platform MySQL pool ready (database: ${PLATFORM_DB})`);
  } catch (e) {
    console.error('Platform MySQL connection failed:', e.message);
    console.error(`Make sure the "${PLATFORM_DB}" database exists and has the platform schema.`);
    console.error('Run: mysql -u root -p < platform_schema.sql');
  }
})();
