const express = require('express');
const router = express.Router();
const { insertSchemeWithCategories ,getSchemeCategoryTree,getAllSchemes,insertSchemeData, getAllSchemes2,getPendingApprovals,approveData,rejectData,getSchemeData,updateSchemeData} = require('../controllers/schemeController');

router.post('/scheme', insertSchemeWithCategories);
router.get('/scheme/:schemeCode/categories', getSchemeCategoryTree);
router.get('/scheme/list', getAllSchemes);
// Aradhana
router.get('/scheme/list2', getAllSchemes2);
// 
router.post('/scheme/data', insertSchemeData);

router.get("/scheme/:schemeCode", getPendingApprovals);

// Approve a pending request
router.post("/scheme/:id/approve", approveData);

// Reject a pending request
router.post("/scheme/:id/reject", rejectData);

router.get("/scheme/:schemeCode/data", getSchemeData);
router.put("/scheme/:schemeCode/data/:id", updateSchemeData);

module.exports = router;
