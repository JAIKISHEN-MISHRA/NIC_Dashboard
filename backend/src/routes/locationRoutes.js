const express = require('express');
const router = express.Router();
const {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  getDepartment,
  getMinistry
} = require('../controllers/locationController');

router.get('/states', getStates);
// aaru
router.get('/departments/:state_code', getDepartment);
router.get('/ministry', getMinistry);

// 
router.get('/divisions/:state_code', getDivisions);
router.get('/districts', getDistricts);
router.get('/talukas', getTalukas);

module.exports = router;
