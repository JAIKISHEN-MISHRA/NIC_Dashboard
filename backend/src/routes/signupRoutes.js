const express = require('express');
const router = express.Router();
const { handleSignup,getPendingSignups,approveSignup } = require('../controllers/signupController');

router.post('/signup', handleSignup);

router.get('/pending-signups', getPendingSignups);
router.post('/approve/:id', approveSignup);


module.exports = router;
