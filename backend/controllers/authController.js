import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    // Handle common signup errors for clearer feedback
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    if (error?.name === 'ValidationError') {
      const firstError = Object.values(error.errors)?.[0]?.message || 'Validation error';
      return res.status(400).json({ message: firstError });
    }
    if (error?.message?.toLowerCase().includes('secret')) {
      return res.status(500).json({ message: 'Server misconfigured: missing JWT secret' });
    }
    const fallbackMessage =
      process.env.NODE_ENV === 'production'
        ? 'Signup failed. Please try again.'
        : `Signup failed: ${error.message}`;
    return res.status(500).json({ message: fallbackMessage });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

