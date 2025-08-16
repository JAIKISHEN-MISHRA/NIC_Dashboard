const express = require('express');
const router = express.Router();
const { handleSignup,getPendingSignups,approveSignup,handleLogin, handleChangePassword } = require('../controllers/signupController');
const { verifyToken, checkRole } = require('../Middleware/middleWare');
const { updateSuperUserInfo } = require('../controllers/schemeController');

router.post('/signup', handleSignup);

router.get('/pending-signups',verifyToken,checkRole("AD","SA")  ,getPendingSignups);
router.post('/approve/:id',verifyToken,checkRole("AD","SA") ,approveSignup);
router.post('/login', handleLogin);
router.post('/change-password',verifyToken,checkRole("AD","SA","DE","VW"),handleChangePassword);

router.post("/superuser/update-info", verifyToken,updateSuperUserInfo);




module.exports = router;
