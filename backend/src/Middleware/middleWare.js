const jwt=require("jsonwebtoken");
// Verify Token Middleware
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer token
  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
            console.log(req.user)

    next();
    
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

// Role-Based Access Middleware
exports.checkRole = (...allowedRoles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!allowedRoles.includes(req.user.role_code)) {
      return res.status(403).json({ message: "Forbidden: You do not have permission." });
    }

    next();
  };
};
