const express = require('express');
const router = express.Router();
const { insertSchemeWithCategories ,getSchemeCategoryTree,getAllSchemes} = require('../controllers/schemeController');

router.post('/scheme', insertSchemeWithCategories);
router.get('/scheme/:schemeCode/categories', getSchemeCategoryTree);
router.get('/scheme/list', getAllSchemes);

module.exports = router;
