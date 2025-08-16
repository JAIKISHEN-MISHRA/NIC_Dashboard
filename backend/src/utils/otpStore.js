// utils/otpStore.js
const otpStore = new Map();

exports.generateOTP = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.saveOTP = function (key, emailOTP, smsOTP) {
  otpStore.set(key, {
    emailOTP,
    smsOTP,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });
};

exports.getOTP = function (key) {
  const otpData = otpStore.get(key);
  if (!otpData) return null;

  // Check expiration
  if (Date.now() > otpData.expiresAt) {
    otpStore.delete(key);
    return null;
  }
  return otpData;
};

exports.clearOTP = function (key) {
  otpStore.delete(key);
};
