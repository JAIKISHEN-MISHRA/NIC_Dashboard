const express = require('express');
const router = express.Router();
const { insertSchemeWithCategories ,getSchemeCategoryTree,getAllSchemes,insertSchemeData} = require('../controllers/schemeController');

router.post('/scheme', insertSchemeWithCategories);
router.get('/scheme/:schemeCode/categories', getSchemeCategoryTree);
router.get('/scheme/list', getAllSchemes);
router.post('/scheme/data', insertSchemeData);

module.exports = router;
