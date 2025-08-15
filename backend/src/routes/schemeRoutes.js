const express = require('express');
const router = express.Router();
const { insertSchemeWithCategories ,getSchemeCategoryTree,getAllSchemes,insertSchemeData, getAllSchemes2,getPendingApprovals,approveData,rejectData,getSchemeData,updateSchemeData} = require('../controllers/schemeController');
const { verifyToken, checkRole } = require('../Middleware/middleWare');

router.post('/scheme', verifyToken,checkRole("AD","SA"),insertSchemeWithCategories);
router.get('/scheme/:schemeCode/categories', verifyToken,checkRole("AD","SA","VW","DE"),getSchemeCategoryTree);
router.get('/scheme/list', getAllSchemes);
// Aradhana
router.get('/scheme/list2', getAllSchemes2);
// 
router.post('/scheme/data', verifyToken,checkRole("DE","SA"),insertSchemeData);

router.get("/scheme/:schemeCode", verifyToken,checkRole("AD","SA"),getPendingApprovals);

// Approve a pending request
router.post("/scheme/:id/approve",verifyToken,checkRole("AD","SA") ,approveData);

// Reject a pending request
router.post("/scheme/:id/reject",verifyToken,checkRole("AD","SA"), rejectData);

router.get("/scheme/:schemeCode/data",verifyToken,checkRole("DE","SA"), getSchemeData);
router.put("/scheme/:schemeCode/data/:id",verifyToken,checkRole("DE","SA") ,updateSchemeData);

module.exports = router;
