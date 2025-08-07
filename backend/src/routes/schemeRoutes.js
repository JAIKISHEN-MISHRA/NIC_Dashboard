const express = require('express');
const router = express.Router();
const { insertSchemeWithCategories ,getSchemeCategoryTree,getAllSchemes,insertSchemeData, getAllSchemes2} = require('../controllers/schemeController');

router.post('/scheme', insertSchemeWithCategories);
router.get('/scheme/:schemeCode/categories', getSchemeCategoryTree);
router.get('/scheme/list', getAllSchemes);
// Aradhana
router.get('/scheme/list2', getAllSchemes2);
// 
router.post('/scheme/data', insertSchemeData);

module.exports = router;
