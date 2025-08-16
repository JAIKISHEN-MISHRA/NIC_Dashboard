// File: routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const { getDashboardData,getTimeSeriesData } = require('../controllers/dashboardController');

router.post('/getDashboardData', getDashboardData);
router.post('/dashboard/timeseries', getTimeSeriesData);

module.exports = router;
