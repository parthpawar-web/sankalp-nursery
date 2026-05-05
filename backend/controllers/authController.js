import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    REGISTER a new user/farmer
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if all required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required registration details' });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // 3. Create the user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'farmer',
    });

    // 4. Return success response with generated JWT token
    if (user) {
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id), // Signs a JWT token for persistent login
      });
    } else {
      res.status(400).json({ success: false, message: 'Registration failed due to invalid data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

/**
 * @desc    LOGIN user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });

    // 2. Check credentials using user.matchPassword (defined in userModel)
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        message: 'Login successful',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      // Security Tip: Keep error messages vague (don't specify if email or password was wrong)
      res.status(401).json({ success: false, message: 'Invalid credentials provided' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: `Login error: ${error.message}` });
  }
};
