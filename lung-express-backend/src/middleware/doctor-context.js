/**
 * Middleware to extract doctor context from request headers
 * Used to filter data by doctor_id for hospital tenants
 */

/**
 * Extracts doctor context from request
 * Sets req.doctorId and req.userRole
 */
export function doctorContext(req, res, next) {
  // Get doctor ID and role from headers (set by frontend after login)
  const doctorId = req.headers['x-doctor-id'];
  const userRole = req.headers['x-user-role'];
  
  if (doctorId && doctorId !== 'null' && doctorId !== 'undefined') {
    req.doctorId = parseInt(doctorId, 10);
  }
  
  if (userRole) {
    req.userRole = userRole;
  }
  
  next();
}

/**
 * Helper to build WHERE clause for doctor filtering
 * For hospital tenants: filters by doctor_id
 * For single doctor tenants or super_admin: no filter (sees all)
 * 
 * @param {Request} req - Express request
 * @param {string} doctorIdColumn - Column name for doctor_id (default: 'doctor_id')
 * @returns {{ whereSql: string, params: any[] }}
 */
export function getDoctorFilter(req, doctorIdColumn = 'doctor_id') {
  // If user is super_admin, they see all data
  if (req.userRole === 'super_admin') {
    return { whereSql: '', params: [] };
  }
  
  // If doctor_id is set, filter by it
  if (req.doctorId) {
    return {
      whereSql: `${doctorIdColumn} = ?`,
      params: [req.doctorId]
    };
  }
  
  // No filter (single doctor tenant or no context)
  return { whereSql: '', params: [] };
}

/**
 * Helper to get doctor_id value for INSERT operations
 * @param {Request} req - Express request
 * @returns {number|null}
 */
export function getDoctorIdForInsert(req) {
  return req.doctorId || null;
}
