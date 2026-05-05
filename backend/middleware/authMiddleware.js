import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

/**
 * @desc    MIDDLEWARE: Protect routes from non-registered users
 * This function checks the "Authorization" header for a valid Bearer token.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token (e.g., "Bearer YOUR_TOKEN_HERE" -> "YOUR_TOKEN_HERE")
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user in DB and attach to the 'req' object (excluding password)
      // This allows the next function in the chain to use 'req.user'
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User reference not found' });
      }

      next(); // Continue to the controller
    } catch (err) {
      console.error('Auth Middleware Error:', err.message);
      return res.status(401).json({ success: false, message: 'Session expired or invalid token' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized - please login first' });
  }
};

/**
 * @desc    MIDDLEWARE: Restrict access to Admins only
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied - Admin privileges required' });
  }
};
