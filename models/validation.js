const jwt = require("jsonwebtoken");

const validateAccessToken = (req, res, next) => {
  const token = req.headers.authorization;
  console.log("token:",token)
  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESSTOKENSECRET);
    req.user = decoded.user; 
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Invalid access token:', error.message);
    res.status(401).json({ message: 'Invalid access token' });
  }
};

module.exports = validateAccessToken;
