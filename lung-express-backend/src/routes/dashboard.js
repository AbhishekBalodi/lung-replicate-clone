import express from 'express';
import { getSuperAdminDashboard } from '../lib/superadmin.dashboard.kpi.js';
import { getSuperAdminDashboardCharts } from '../lib/superadmin.dashboard.charts.js';

const router = express.Router();

router.get('/superadmin', getSuperAdminDashboard);
router.get('/superadmin/charts', getSuperAdminDashboardCharts);

export default router;

