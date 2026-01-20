import { getTenantPool } from './tenant-db.js';

/* ============================================================
   FEEDBACK MANAGEMENT - Surveys, Responses, Analytics
   ============================================================ */

/**
 * GET /api/dashboard/feedback/summary
 * Returns feedback statistics
 */
export async function getFeedbackSummary(req, res) {
  try {
    const db = getTenantPool(req);

    // Total feedback count
    const [[{ totalFeedback }]] = await db.query(
      `SELECT COUNT(*) AS totalFeedback FROM reviews`
    );

    // Average rating
    const [[{ avgRating }]] = await db.query(
      `SELECT COALESCE(AVG(rating), 0) AS avgRating FROM reviews`
    );

    // Rating distribution
    const [ratingDistribution] = await db.query(`
      SELECT rating, COUNT(*) AS count
      FROM reviews
      GROUP BY rating
      ORDER BY rating DESC
    `);

    // Recent feedback count (last 30 days)
    const [[{ recentCount }]] = await db.query(`
      SELECT COUNT(*) AS recentCount
      FROM reviews
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    // Feedback by resource type
    const [byType] = await db.query(`
      SELECT resource_type, COUNT(*) AS count, AVG(rating) AS avgRating
      FROM reviews
      GROUP BY resource_type
    `);

    res.json({
      totalFeedback,
      avgRating: Number(avgRating).toFixed(1),
      recentCount,
      ratingDistribution,
      byType
    });
  } catch (error) {
    console.error('❌ Feedback summary error:', error);
    res.status(500).json({ error: 'Failed to load feedback summary' });
  }
}

/**
 * GET /api/dashboard/feedback/list
 * Returns feedback/reviews list
 */
export async function getFeedbackList(req, res) {
  try {
    const db = getTenantPool(req);
    const { type, rating, search } = req.query;

    let query = `
      SELECT 
        r.id,
        r.resource_type,
        r.resource_id,
        r.rating,
        r.comment,
        r.created_at,
        CASE 
          WHEN r.resource_type = 'doctor' THEN (SELECT name FROM doctors WHERE id = r.resource_id)
          ELSE 'Hospital'
        END AS resource_name
      FROM reviews r
      WHERE 1=1
    `;
    const params = [];

    if (type && type !== 'all') {
      query += ` AND r.resource_type = ?`;
      params.push(type);
    }
    if (rating && rating !== 'all') {
      query += ` AND r.rating = ?`;
      params.push(Number(rating));
    }
    if (search) {
      query += ` AND r.comment LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY r.created_at DESC LIMIT 100`;

    const [feedback] = await db.query(query, params);

    res.json({ feedback });
  } catch (error) {
    console.error('❌ Feedback list error:', error);
    res.status(500).json({ error: 'Failed to load feedback list' });
  }
}
