
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // Get token from Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  // Check whether token exists
  if (!token) {
    return res.status(401).json({
      message: "Access denied. Token required."
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Store faculty ID in request
    req.facultyId = decoded.facultyId;

    // Continue to the API route
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = auth;
