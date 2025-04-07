const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ JWT Payload:", decoded); // 👈 Add this
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT Error:", err.message); // 👈 And this
    res.status(401).json({ message: 'Invalid token' });
  }
};


const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = { authenticate, authorizeRoles };
