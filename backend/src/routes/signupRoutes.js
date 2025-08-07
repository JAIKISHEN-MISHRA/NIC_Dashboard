const express = require('express');
const router = express.Router();
const { handleSignup,getPendingSignups,approveSignup,handleLogin, handleChangePassword } = require('../controllers/signupController');

router.post('/signup', handleSignup);

router.get('/pending-signups', getPendingSignups);
router.post('/approve/:id', approveSignup);
router.post('/login', handleLogin);
router.post('/change-password', handleChangePassword);



module.exports = router;
