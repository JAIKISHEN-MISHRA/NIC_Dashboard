// File: routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const { getDashboardData,getTimeSeriesData } = require('../controllers/dashboardController');

router.get('/getDashboardData', getDashboardData);
router.get('/dashboard/timeseries', getTimeSeriesData);

module.exports = router;
